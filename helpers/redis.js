import dotenv from 'dotenv'
import redis from 'redis'

dotenv.config()

class RedisClientService {
	constructor() {
		this.client = null
	}

	async connect() {
		if (this.client?.isReady) {
			return this.client
		}
		if (this.client) {
			await new Promise((resolve) => {
				const check = () => {
					if (this.client?.isReady) {
						resolve(this.client)
					} else {
						setTimeout(check, 100)
					}
				}
				check()
			})
			return this.client
		}
		try {
			this.client = redis.createClient({ url: process.env.REDIS_URL })

			this.client.on('connect', () => {
				console.log('Redis connected')
			})

			this.client.on('ready', () => {
				console.log('Redis connected and ready')
			})
			this.client.on('error', (err) => {
				console.error(`Redis error:`, err)
			})

			this.client.on('end', () => {
				console.log('Redis connection closed')
			})

			await this.client.connect()

			return this.client
		} catch (error) {
			console.error(`Failed to connect to Redis:`, error)
			this.client = null
			throw error
		}
	}

	async disconnect() {
		if (this.client) {
			await this.client.disconnect()
			this.client = null
		}
	}

	async get(key) {
		try {
			await this.connect()
			let res = this.client.get(key)
			return res
		} catch (error) {
			console.error(`Error GETting redis ${key}`, error)
			return null
		}
	}

	async set(key, val) {
		try {
			console.log(`Redis SETting ${key}`)
			await this.connect()
			const res = this.client.setEx(key, 60 * 60 * 24, val) // 24 hours
			return res
		} catch (error) {
			console.error(`Error SETting redis ${key}`, error)
			return null
		}
	}
}

const redisClient = new RedisClientService()
redisClient.connect()

export default redisClient
