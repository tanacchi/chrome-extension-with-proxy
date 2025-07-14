import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorDisplay } from './ErrorDisplay'

describe('ErrorDisplay', () => {
  it('すべてのエラーコンポーネントが表示される', () => {
    const error = new Error('Test error')
    const mockReset = vi.fn()

    render(<ErrorDisplay error={error} resetErrorBoundary={mockReset} />)

    // ErrorHeader
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()

    // ErrorStackTraceList
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('Error details')).toBeInTheDocument()

    // ErrorResetButton
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('エラーとリセット関数がなくても正常に表示される', () => {
    render(<ErrorDisplay />)

    // ErrorHeader
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()

    // ErrorStackTraceList (デフォルトメッセージ)
    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument()

    // ErrorResetButton
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('エラーオブジェクトが正しく子コンポーネントに渡される', () => {
    const error = new Error('Specific error message')
    error.stack = 'Error: Specific error message\n    at test.js:1:1'

    render(<ErrorDisplay error={error} />)

    // ErrorStackTraceList にエラーが正しく渡されている
    expect(screen.getByText('Specific error message')).toBeInTheDocument()
    expect(screen.getByText('Stack trace')).toBeInTheDocument()
  })

  it('リセット関数が子コンポーネントに正しく渡される', () => {
    const mockReset = vi.fn()

    render(<ErrorDisplay resetErrorBoundary={mockReset} />)

    const resetButton = screen.getByRole('button', { name: 'Try again' })
    expect(resetButton).toBeInTheDocument()

    // ボタンが正しく動作することを確認
    resetButton.click()
    expect(mockReset).toHaveBeenCalledOnce()
  })

  it('メインコンテナに正しいスタイルが適用される', () => {
    render(<ErrorDisplay />)

    const mainContainer = screen
      .getByRole('heading', { name: 'Something went wrong' })
      .closest('div')?.parentElement
    expect(mainContainer).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'bg-gray-50',
      'px-4',
      'py-6',
      'sm:px-6',
      'lg:px-8',
    )
  })

  it('内部コンテナに正しいスタイルが適用される', () => {
    render(<ErrorDisplay />)

    const innerContainer = screen
      .getByRole('heading', { name: 'Something went wrong' })
      .closest('div')?.parentElement
    expect(innerContainer?.firstChild).toHaveClass('w-full', 'max-w-md', 'space-y-8')
  })

  it('コンポーネントの表示順序が正しい', () => {
    const error = new Error('Test error')
    const mockReset = vi.fn()

    render(<ErrorDisplay error={error} resetErrorBoundary={mockReset} />)

    const container = screen.getByRole('heading', { name: 'Something went wrong' }).closest('div')
      ?.parentElement?.firstChild
    const children = container?.children

    // 1番目: ErrorHeader
    expect(children?.[0]).toContainElement(
      screen.getByRole('heading', { name: 'Something went wrong' }),
    )

    // 2番目: ErrorStackTraceList
    expect(children?.[1]).toContainElement(screen.getByText('Error details'))

    // 3番目: ErrorResetButton
    expect(children?.[2]).toContainElement(screen.getByRole('button', { name: 'Try again' }))
  })

  it('レスポンシブなスタイルが適用される', () => {
    render(<ErrorDisplay />)

    const mainContainer = screen
      .getByRole('heading', { name: 'Something went wrong' })
      .closest('div')?.parentElement

    // レスポンシブなpaddingクラスが適用されている
    expect(mainContainer).toHaveClass('px-4', 'py-6', 'sm:px-6', 'lg:px-8')
  })

  it('エラーが複雑なオブジェクトでも正常に処理される', () => {
    const complexError = new Error('Complex error')
    complexError.name = 'CustomError'
    complexError.stack = 'CustomError: Complex error\n    at complex.js:10:5'

    render(<ErrorDisplay error={complexError} />)

    expect(screen.getByText('Complex error')).toBeInTheDocument()
    expect(screen.getByText('Stack trace')).toBeInTheDocument()
  })

  it('リセット関数が非同期でも正常に動作する', async () => {
    const mockAsyncReset = vi.fn().mockResolvedValue(undefined)

    render(<ErrorDisplay resetErrorBoundary={mockAsyncReset} />)

    const resetButton = screen.getByRole('button', { name: 'Try again' })
    await resetButton.click()

    expect(mockAsyncReset).toHaveBeenCalledOnce()
  })
})
