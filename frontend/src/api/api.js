import { detectPhishing } from "../models/phishingmodel"
import { detectNetwork } from "../models/networkmodel"
import { detectGPS } from "../models/gpsmodel"

export function analyzeEmail(email){

  return detectPhishing(email)

}

export function analyzeNetwork(log){

  return detectNetwork(log)

}

export function analyzeGPS(points){

  return detectGPS(points)

}