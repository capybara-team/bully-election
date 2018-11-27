import { getArg } from './utils';
import Bully from './Bully'
import allNodes from './nodes.js'

const id = Number.parseInt(getArg('node-id', 0))

const nodes = allNodes.filter(node => node.id !== id)

const bully = new Bully({ id, port: 4000 + id, nodes })

bully.start()