import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorStackTraceList } from './ErrorStackTraceList'

describe('ErrorStackTraceList', () => {
  it('エラーメッセージが表示される', () => {
    const error = new Error('Test error message')
    render(<ErrorStackTraceList error={error} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('エラーがないときにデフォルトメッセージが表示される', () => {
    render(<ErrorStackTraceList />)

    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument()
  })

  it('エラーオブジェクトが空の場合にデフォルトメッセージが表示される', () => {
    const error = {} as Error
    render(<ErrorStackTraceList error={error} />)

    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument()
  })

  it('エラー詳細情報のタイトルが表示される', () => {
    const error = new Error('Test error')
    render(<ErrorStackTraceList error={error} />)

    expect(screen.getByText('Error details')).toBeInTheDocument()
  })

  it('スタックトレースがある場合にdetailsが表示される', () => {
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at test.js:1:1'
    render(<ErrorStackTraceList error={error} />)

    expect(screen.getByText('Stack trace')).toBeInTheDocument()
  })

  it('スタックトレースがない場合にdetailsが表示されない', () => {
    const error = new Error('Test error')
    error.stack = undefined
    render(<ErrorStackTraceList error={error} />)

    expect(screen.queryByText('Stack trace')).not.toBeInTheDocument()
  })

  it('スタックトレースが空の場合にdetailsが表示されない', () => {
    const error = new Error('Test error')
    error.stack = ''
    render(<ErrorStackTraceList error={error} />)

    expect(screen.queryByText('Stack trace')).not.toBeInTheDocument()
  })

  it('スタックトレースの詳細をクリックで開けるる', async () => {
    const user = userEvent.setup()
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at test.js:1:1'
    render(<ErrorStackTraceList error={error} />)

    const summary = screen.getByText('Stack trace')
    await user.click(summary)

    expect(screen.getByText('Error: Test error\n    at test.js:1:1')).toBeInTheDocument()
  })

  it('正しいスタイルが適用される', () => {
    const error = new Error('Test error')
    render(<ErrorStackTraceList error={error} />)

    // メインコンテナのスタイル
    const mainContainer = screen.getByText('Error details').closest('div')
    expect(mainContainer).toHaveClass('overflow-hidden', 'rounded-lg', 'bg-white', 'shadow')

    // エラーメッセージのスタイル
    const errorMessage = screen.getByText('Test error')
    expect(errorMessage).toHaveClass('break-all', 'font-mono', 'text-red-700')

    // エラー詳細のスタイル
    const errorDetails = screen.getByText('Error details')
    expect(errorDetails).toHaveClass('mb-2', 'font-medium', 'text-gray-700')
  })

  it('エラーメッセージコンテナに正しいスタイルが適用される', () => {
    const error = new Error('Test error')
    render(<ErrorStackTraceList error={error} />)

    const errorMessageContainer = screen.getByText('Test error').closest('div')
    expect(errorMessageContainer).toHaveClass('overflow-auto', 'rounded-md', 'bg-red-50', 'p-4')
  })

  it('スタックトレースの詳細に正しいスタイルが適用される', () => {
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at test.js:1:1'
    render(<ErrorStackTraceList error={error} />)

    const summary = screen.getByText('Stack trace')
    expect(summary).toHaveClass('cursor-pointer', 'text-sm', 'text-red-700')
  })

  it('長いエラーメッセージも正しく表示される', () => {
    const longMessage =
      'This is a very long error message that should be displayed properly even when it exceeds the normal width of the container'
    const error = new Error(longMessage)
    render(<ErrorStackTraceList error={error} />)

    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  it('特殊文字を含むエラーメッセージも正しく表示される', () => {
    const specialMessage = 'Error with special chars: <>&"\'`'
    const error = new Error(specialMessage)
    render(<ErrorStackTraceList error={error} />)

    expect(screen.getByText(specialMessage)).toBeInTheDocument()
  })

  it('複数行のスタックトレースが正しく表示される', () => {
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at test.js:1:1\n    at another.js:2:5'
    render(<ErrorStackTraceList error={error} />)

    const stackTrace = screen.getByText(
      'Error: Test error\n    at test.js:1:1\n    at another.js:2:5',
    )
    expect(stackTrace).toBeInTheDocument()
    expect(stackTrace).toHaveClass('mt-2', 'overflow-auto', 'p-2', 'text-xs', 'text-red-800')
  })
})
