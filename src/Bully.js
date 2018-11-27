import express from 'express'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'

/**
 * Bully Class
 *
 * @export
 * @class Bully
 */
export default class Bully {
    constructor({ id, port = 4000 + id, nodes = [] }) {
        this.leader = id
        this.id = id
        this.port = port
        this.nodes = nodes
        this.online = true
        this.address = 'http://localhost:' + port

        this.server = express()
        this.setupRoutes()
    }

    /**
     * Get node status
     *
     * @returns {Object} status of node
     * @memberof Bully
     */
    getStatus() {
        return {
            id: this.id,
            port: this.port,
            online: this.online,
            leader: this.leader,
            address: this.address
        }
    }
    /**
     * Setup Node routes
     *
     * @memberof Bully
     */
    setupRoutes() {
        const { server } = this

        server.use(bodyParser.json())

        // set server online/offline
        server.all('/toggle', (req, res) => {
            this.toggleServer()
            res.send({ ...this.getStatus(), reelecting: this.online })
        })

        // status route
        server.all('/status', (req, res) => res.send(this.getStatus()))

        // check if the server is online
        server.use((req, res, next) => {
            if (this.online)
                return next()
            res.status(503).send()
        })

        // get status
        server.get('/election', (req, res) => {
            res.json('OK');
            this.getLeader()
        })

        // set leader
        server.post('/election', (req, res) => {
            this.setLeader(req.body.leader)
            res.json('OK')
        })

        server.get('/leader', (req, res) => {
            this.fetchLeaderNode()
                .then(leaderStatus => res.send({ leaderStatus }))
                .catch(() => {
                    res.send({ error: 'Leader offline. Re-electing...' })
                    this.getLeader()
                })
        })

        //default route
        server.all('*', (req, res) => res.send(this.getStatus()))
    }

    /**
     * Start node HTTP Server and election
     * 
     * @memberof Bully
     */
    start() {
        const { server, port } = this

        server.listen(port, () => {
            this.log(`Start at http://localhost:${port}. Starting election...`)
            this.getLeader()
        })
    }

    /**
     * Return array of bully nodes
     *
     * @returns {Array} bully nodes
     * @memberof Bully
     */
    getBullyNodes() {
        return this.nodes
            .filter(({ id }) => this.id < id)
    }

    /**
     * Make an HTTP Request for nodes   
     *
     * @param {Array} nodes nodes to request
     * @param {string} [route='/'] route to access
     * @param {Object} [{ headers = {}, body, ...settings }={}] Request settings
     * @returns {Promise} response Promise
     * @memberof Bully
     */
    fetchNodes(nodes, route = '/', { headers = {}, body, ...settings } = {}) {
        return Promise.all(nodes.map(
            ({ address }) => fetch(address + route, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: body && JSON.stringify(body),
                ...settings
            })
                .then(res => res.json())
                .catch(error => error)
        ))
            .catch(console.error)
    }

    /**
     * Make an HTTP Request for Leader node
     *
     * @param {*} args fetchNodes arguments
     * @returns {Promise} response Promise
     * @memberof Bully
     */
    fetchLeaderNode(...args) {
        const leaderNode = this.leader === this.id ? this :
            this.nodes.find(({ id }) => id === this.leader)

        return this
            .fetchNodes([leaderNode], ...args)
            .then(([response]) => response)
            .then(data => (data instanceof Error) ? Promise.reject(data) : data)
    }

    /**
     * Get the current leader of parent nodes.
     *
     * @memberof Bully
     */
    async getLeader() {
        const responses = await this.fetchNodes(this.getBullyNodes(), '/election')

        // If no response, announce leadership
        if (!responses.find(res => res === 'OK'))
            this.announceLeader()

    }

    /**
     * Announce Leadership of this node
     *
     * @memberof Bully
     */
    async announceLeader() {
        // this.log(`Announcing leadership.`)

        await this.fetchNodes(this.nodes, '/election', { method: 'POST', body: { leader: this.id } })

        this.setLeader(this.id)
    }

    /**
     * Set new leader
     *
     * @param {Number} leader Leader ID
     * @memberof Bully
     */
    setLeader(leader) {
        if (this.leader === leader) return
        this.log('New leader: ', leader)
        this.leader = leader
    }

    /**
     * Log in the console
     *
     * @param {...any} args log arguments
     * @memberof Bully
     */
    log(...args) {
        console.log(`node ${this.id} |`, ...args)
    }

    /**
     * Toggle Server online/offline
     *
     * @memberof Bully
     */
    toggleServer() {
        this.online = !this.online;
        if (this.online)
            this.getLeader()
    }
}