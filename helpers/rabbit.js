import amqp from 'amqplib'
import { EventEmitter } from 'events'
import dotenv from 'dotenv'

dotenv.config()

class RabbitMQ extends EventEmitter {
	constructor() {
		super()
		this.connection = null
		this.channel = null
		this.consumerTag = null
		this.reconnectTimeout = null
	}

	async connect() {
		if (this.connection) {
			return this.channel
		}
		try {
			this.connection = await amqp.connect(process.env.RABBITMQ_URL)
			this.channel = await this.connection.createChannel()
			this.emit('connected')
			this.addListeners()
		} catch (error) {
			this.emit('error', error)
			this.reconnect()
		}
	}

	addListeners() {
		this.connection.on('error', (error) =>
			this.handleDisconnect('error', error)
		)
		this.connection.on('close', (error) =>
			this.handleDisconnect('close', error)
		)
	}

	handleDisconnect(reason, error) {
		this.connection = null
		this.channel = null
		this.emit('disconnected', { reason, error })
		this.reconnect()
	}

	reconnect() {
		if (this.reconnectTimeout) {
			return
		}
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
			this.emit('error', error)
		}
	}

	async consume(queueName, messageHandler) {
		try {
			const consumer = await this.channel.consume(
				queueName,
				(msg) => this.handleMessage(msg, messageHandler),
				{ consumerTag: 'default' }
			)
			this.consumerTag = consumer?.consumerTag
			this.emit('consumeStarted', this.consumerTag)
		} catch (error) {
			this.emit('error', error)
		}
	}

	handleMessage(msg, messageHandler) {
		try {
			const message = JSON.parse(msg.content.toString())
			messageHandler(msg, message)
		} catch (error) {
			this.emit('error', error)
		}
	}
}

const rabbit = new RabbitMQ()
rabbit.on('connected', () => console.log('RabbitMQ connection established'))
rabbit.on('disconnected', ({ reason, error }) =>
	console.log(`RabbitMQ connection dropped (${reason}):`, error)
)
rabbit.on('consumeStarted', (consumerTag) =>
	console.log(`Started consumer: ${consumerTag}`)
)
rabbit.on('error', (error) => console.log('Error:', error))

rabbit.connect()

async function stopConsuming(event) {
	try {
		console.log(
			`Received ${event}, stopping the consumer ${rabbit.consumerTag}`
		)
		if (rabbit.connection) {
			await rabbit.channel.cancel(rabbit.consumerTag || 'default')
			console.log(`Received ${event}, stopped the consumer`)
		} else {
			console.log(`Couldn't stop consumer, closing connection`)
			await rabbit.close()
			console.log(`Couldn't stop consumer, closed connection`)
		}
	} catch (error) {
		console.log('Error in stopConsuming', error)
	}
}

async function stopListening(event) {
	try {
		console.log(`Received ${event}, stopping listening`)
		if (rabbit.connection) {
			await rabbit.channel.close()
			console.log(`Received ${event}, stopped listening`)
		} else {
			console.log(`Couldn't stop listening, closing connection`)
			await rabbit.close()
			console.log(`Couldn't stop listening, closed connection`)
		}
	} catch (error) {
		console.log('Error in stopListening', error)
	}
}

process.on('SIGTERM', stopConsuming)
process.on('SIGINT', stopListening)

export default rabbit
