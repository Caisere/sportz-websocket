import { WATCH_MATCHES } from "../validations/matches.js";

export function getMatchStatus(startTime, endTime, now = new Date()) {
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null
    }

    if (now < start) {
        return WATCH_MATCHES.SCHEDULED
    }

    if (now >= end) {
        return WATCH_MATCHES.FINISHED
    }

    return WATCH_MATCHES.LIVE
}

export async function syncMatchStatus(match, updateStatus) {
    const nextStatus = getMatchStatus(match.start, match.end)

    if (!nextStatus) {
        return match.status
    }

    if (match.status !== nextStatus) {
        await updateStatus(nextStatus)
        match.status = nextStatus
    }

    return match.status
}