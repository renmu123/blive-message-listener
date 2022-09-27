import {
  HEARTBEAT, type AttentionChangeMsgHandler,
  DANMU_MSG, type DanmuMsgHandler,
  GUARD_BUY, type GuardBuyHandler,
  INTERACT_WORD, ENTRY_EFFECT, type NewComerMsgHandler,
  SEND_GIFT, type GiftHandler,
  SUPER_CHAT_MESSAGE, type SuperChatHandler,
  WATCHED_CHANGE, type WatchedChangeHandler,
} from '../parser'
import type { Message } from '../types/app'
import type { KeepLiveTCP, KeepLiveWS } from 'tiny-bilibili-ws'

export type MsgHandler = Partial<
  {
    /** 连接成功 */
    onOpen: () => void,
    /** 连接关闭 */
    onClose: () => void,
    /** 连接错误 */
    onError: (e: Error) => void,
    /** 开始监听消息 */
    onStartListen: () => void,
  }
  & AttentionChangeMsgHandler
  & DanmuMsgHandler
  & GuardBuyHandler
  & NewComerMsgHandler
  & GiftHandler
  & SuperChatHandler
  & WatchedChangeHandler
>

const normalizeDanmu = <T>(msgType: string, body: T): Message<T> => {
  const timestamp = Date.now()
  const randomText = Math.floor(Math.random() * 10000).toString()
  // @ts-ignore
  const id = `${timestamp}_${msgType}_${body.user?.uid}_${randomText}`
  return {
    id,
    timestamp,
    type: msgType,
    body,
  }
}

export const listenAll = (instance: KeepLiveTCP | KeepLiveWS, roomId: number, handler?: MsgHandler) => {
  if (!handler) return

  // Common
  if (handler.onOpen) {
    instance.on('open', () => {
      handler.onOpen?.()
    })
  }
  if (handler.onClose) {
    instance.on('close', () => {
      handler.onClose?.()
    })
  }
  if (handler.onStartListen) {
    instance.on('live', () => {
      handler.onStartListen?.()
    })
  }

  // HEARTBEAT
  if (handler[HEARTBEAT.handlerName]) {
    instance.on(HEARTBEAT.eventName, (data: any) => {
      const parsedData = HEARTBEAT.parser(data.data)
      handler[HEARTBEAT.handlerName]?.(normalizeDanmu(HEARTBEAT.eventName, parsedData))
    })
  }

  // DANMU_MSG
  if (handler[DANMU_MSG.handlerName]) {
    instance.on(DANMU_MSG.eventName, (data: any) => {
      const parsedData = DANMU_MSG.parser(data.data, roomId)
      handler[DANMU_MSG.handlerName]?.(normalizeDanmu(DANMU_MSG.eventName, parsedData))
    })
  }

  // GUARD_BUY
  if (handler[GUARD_BUY.handlerName]) {
    instance.on(GUARD_BUY.eventName, (data: any) => {
      const parsedData = GUARD_BUY.parser(data.data)
      handler[GUARD_BUY.handlerName]?.(normalizeDanmu(GUARD_BUY.eventName, parsedData))
    })
  }

  // INTERACT_WORD, ENTRY_EFFECT
  if (handler[INTERACT_WORD.handlerName] || handler[ENTRY_EFFECT.handlerName]) {
    instance.on(INTERACT_WORD.eventName, (data: any) => {
      const parsedData = INTERACT_WORD.parser(data.data, roomId)
      handler[INTERACT_WORD.handlerName]?.(normalizeDanmu(INTERACT_WORD.eventName, parsedData))
    })
    instance.on(ENTRY_EFFECT.eventName, (data: any) => {
      const parsedData = ENTRY_EFFECT.parser(data.data, roomId)
      handler[ENTRY_EFFECT.handlerName]?.(normalizeDanmu(ENTRY_EFFECT.eventName, parsedData))
    })
  }

  // SEND_GIFT
  if (handler[SEND_GIFT.handlerName]) {
    instance.on(SEND_GIFT.eventName, (data: any) => {
      const parsedData = SEND_GIFT.parser(data.data)
      handler[SEND_GIFT.handlerName]?.(normalizeDanmu(SEND_GIFT.eventName, parsedData))
    })
  }

  // SUPER_CHAT_MESSAGE
  if (handler[SUPER_CHAT_MESSAGE.handlerName]) {
    instance.on(SUPER_CHAT_MESSAGE.eventName, (data: any) => {
      const parsedData = SUPER_CHAT_MESSAGE.parser(data.data, roomId)
      handler[SUPER_CHAT_MESSAGE.handlerName]?.(normalizeDanmu(SUPER_CHAT_MESSAGE.eventName, parsedData))
    })
  }

  // WATCHED_CHANGE
  if (handler[WATCHED_CHANGE.handlerName]) {
    instance.on(WATCHED_CHANGE.eventName, (data: any) => {
      const parsedData = WATCHED_CHANGE.parser(data.data)
      handler[WATCHED_CHANGE.handlerName]?.(normalizeDanmu(WATCHED_CHANGE.eventName, parsedData))
    })
  }
}
