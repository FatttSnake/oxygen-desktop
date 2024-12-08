import moment, { unitOfTime } from 'moment/moment'
import dayjs from 'dayjs'

export const getNowLocalTime = (format: string = 'yyyy-MM-DD HH:mm:ssZ') => {
    return moment().local().format(format)
}

export const getNowUtc = () => {
    return moment().toISOString()
}

export const utcToLocalTime = (utcTime: string, format: string = 'yyyy-MM-DD HH:mm:ssZ') => {
    return moment.utc(utcTime).local().format(format)
}

export const dayjsToLocalTime = (date: dayjs.Dayjs, format: string = 'YYYY-MM-DD HH:mm:ssZ') => {
    return date.format(format)
}

export const dayjsToUtc = (date: dayjs.Dayjs) => {
    return date.toISOString()
}

export const localTimeToUtc = (localTime: string) => {
    return moment(localTime).toISOString()
}

export const isPastTime = (utcTime: string) => {
    return moment.utc(utcTime).isBefore(moment.now())
}

export const utcToMillisecond = (utcTime: string) => {
    return moment.utc(utcTime).valueOf()
}

export const millisecondToUtc = (millisecond: number) => {
    return moment(millisecond).toISOString()
}

export const getTimesBetweenTwoTimes = (
    startTime: string,
    endTime: string,
    interval: unitOfTime.Diff
) => {
    const timesList: string[] = []
    const start = moment.utc(startTime)
    const end = moment.utc(endTime)

    const count = end.diff(start, interval)
    timesList.push(start.toISOString())

    for (let i = 0; i < count; i++) {
        timesList.push(start.add(1, interval).toISOString())
    }

    return timesList
}
