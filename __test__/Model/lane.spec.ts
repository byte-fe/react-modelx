/// <reference path="../index.d.ts" />
import { renderHook, act } from '@testing-library/react-hooks'
import { createStore, useModel } from '../../src'
import { timeout } from '../../src/helper'

describe('action return value', () => {
  test('return object value', async () => {
    const { useStore } = createStore(() => {
      const [count, setCount] = useModel(1)
      return { count, setCount }
    })
    let renderTimes = 0
    let displayCount = -1
    const { result } = renderHook(() => {
      console.group('renderTimes: ', renderTimes)
      const { count, setCount } = useStore()
      renderTimes += 1
      console.group('renderTimes: ', renderTimes)
      displayCount = count
      return { renderTimes, displayCount, setCount }
    })
    await act(async () => {
      await timeout(100, {})
      expect(renderTimes).toEqual(1)
    })

    await act(async () => {
      await result.current.setCount(5)
    })

    await act(() => {
      expect(renderTimes).toEqual(2)
      expect(displayCount).toBe(5)
    })
  })
})
