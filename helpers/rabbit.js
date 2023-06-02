import amqp from 'amqplib'

class RabbitMQ {
	constructor() {
		this.connection = null
		this.channel = null
		this.consumerTag = null
		this.connected = false
		this.connecting = false
		this.reconnectTimeout = null
	}

	async connect() {
		const url = process.env.RABBITMQ_URL
		if (this.connected) {
			return this.channel
		}
		if (this.connecting) {
			await new Promise((resolve) => {
				const check = () => {
					if (this.connected) {
						resolve(this.channel)
					} else {
						setTimeout(check, 100)
					}
				}
				check()
			})
			return this.channel
		}
		this.connecting = true
		try {
			this.connection = await amqp.connect(url)
			// defaultLogger.info('RabbitMQ connection established');
			console.log('RabbitMQ connection established')
			this.channel = await this.connection.createChannel()
			//   defaultLogger.info('RabbitMQ channel created');
			console.log('RabbitMQ channel created')
			this.connected = true
			this.connecting = false
			this.connection.on('error', (error) => {
				this.connected = false
				// defaultLogger
				//   .error(`RabbitMQ connection dropped due to an error:`, error)
				//   .slackSend();
				console.log(`RabbitMQ connection dropped due to an error:`, error)
				this.reconnect()
			})
			this.connection.on('close', (error) => {
				// defaultLogger
				//   .error(`RabbitMQ connection dropped (closed):`, error)
				//   .slackSend();
				console.log(`RabbitMQ connection dropped (closed):`, error)
				this.connected = false
				this.reconnect()
			})
			return this.channel
		} catch (error) {
			//   defaultLogger.error(`Failed to connect to RabbitMQ:`, error).slackSend();
			console.log(`Failed to connect to RabbitMQ:`, error)
			this.connected = false
			this.connecting = false
			this.reconnect()
			throw error
		}
	}

	async close() {
		if (this.connection) {
			await this.connection.close()
			this.connection = null
		}
		if (this.channel) {
			await this.channel.close()
			this.channel = null
		}
		this.connected = false
		this.connecting = false
		clearTimeout(this.reconnectTimeout)
	}

	reconnect() {
		if (this.reconnectTimeout) {
			return
		}
		// defaultLogger.error('Reconnecting to RabbitMQ...').slackSend();
		console.log('Reconnecting to RabbitMQ...')
		this.reconnectTimeout = setTimeout(async () => {
			this.reconnectTimeout = null
			await this.connect()
		}, 5000)
	}

	async sendToQueue(queueName, data) {
		try {
			await this.channel.assertQueue(queueName)
			const isSent = this.channel.sendToQueue(
				queueName,
				Buffer.from(JSON.stringify(data))
			)
			if (!isSent) throw Error('sendToQueue returned false')
		} catch (error) {
			//   logger.error('Error in rabbit.sendToQueue', error).slackSend();
			console.log('Error in rabbit.sendToQueue', error)
		}
	}

	async consume(queueName, messageHandler) {
		try {
			const consumer = await this.channel.consume(
				queueName,
				(msg) => {
					try {
						const message = JSON.parse(msg.content.toString())
						messageHandler(msg, message)
					} catch (error) {
						// defaultLogger.error(`Unable to consume message ${msg}`, error);
						console.log(`Unable to consume message ${msg}`, error)
					}
				},
				{
					consumerTag: 'default'
				}
			)
			this.consumerTag = consumer?.consumerTag
			// defaultLogger.info(`Started consumer: ${this.consumerTag}`);
			console.log(`Started consumer: ${this.consumerTag}`)
		} catch (error) {
			// defaultLogger
			//     .error(`Unable to start consuming queue "${queueName}"`, error)
			//     .slackSend();
			console.log(`Unable to start consuming queue "${queueName}"`, error)
		}
	}
}

const rabbit = new RabbitMQ()
rabbit.connect()

async function stopConsuming(event) {
	try {
		// defaultLogger.info(
		//     `Received ${event}, stopping the consumer ${rabbit.consumerTag}`
		console.log(
			`Received ${event}, stopping the consumer ${rabbit.consumerTag}`
		)
		if (rabbit?.connected) {
			await rabbit.channel.cancel(rabbit.consumerTag || 'default')
			// defaultLogger.info(`Received ${event}, stopped the consumer`);
			console.log(`Received ${event}, stopped the consumer`)
		} else {
			// defaultLogger.info(`Couldn't stop consumer, closing connection`);
			console.log(`Couldn't stop consumer, closing connection`)
			await rabbit.close()
			// defaultLogger.info(`Couldn't stop consumer, closed connection`);
			console.log(`Couldn't stop consumer, closed connection`)
		}
	} catch (error) {
		// defaultLogger.error('Error in stopConsuming', error);
		console.log('Error in stopConsuming', error)
	}
}

process.on('SIGTERM', stopConsuming)

export default rabbit
