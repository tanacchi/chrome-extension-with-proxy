import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorResetButton } from './ErrorResetButton'

describe('ErrorResetButton', () => {
  it('リセットボタンが表示される', () => {
    const mockReset = vi.fn()
    render(<ErrorResetButton resetErrorBoundary={mockReset} />)

    const button = screen.getByRole('button', { name: 'Try again' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('リセットボタンのクリックでresetErrorBoundaryが呼ばれる', async () => {
    const mockReset = vi.fn()
    render(<ErrorResetButton resetErrorBoundary={mockReset} />)

    const button = screen.getByRole('button', { name: 'Try again' })
    await fireEvent.click(button)

    expect(mockReset).toHaveBeenCalledOnce()
  })

  it('resetErrorBoundaryがundefinedでもエラーにならない', () => {
    expect(() => {
      render(<ErrorResetButton resetErrorBoundary={undefined} />)
    }).not.toThrow()

    const button = screen.getByRole('button', { name: 'Try again' })
    expect(button).toBeInTheDocument()
  })

  it('resetErrorBoundaryがundefinedの場合のクリックでエラーにならない', async () => {
    render(<ErrorResetButton resetErrorBoundary={undefined} />)

    const button = screen.getByRole('button', { name: 'Try again' })

    expect(async () => {
      await fireEvent.click(button)
    }).not.toThrow()
  })

  it('ボタンに正しいスタイルが適用される', () => {
    const mockReset = vi.fn()
    render(<ErrorResetButton resetErrorBoundary={mockReset} />)

    const button = screen.getByRole('button', { name: 'Try again' })
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-md',
      'border',
      'border-transparent',
      'bg-red-600',
      'px-4',
      'py-2',
      'text-sm',
      'font-medium',
      'text-white',
      'shadow-sm',
      'hover:bg-red-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-red-500',
      'focus:ring-offset-2',
    )
  })

  it('ボタンのコンテナに中央寄せが適用される', () => {
    const mockReset = vi.fn()
    render(<ErrorResetButton resetErrorBoundary={mockReset} />)

    const button = screen.getByRole('button', { name: 'Try again' })
    const container = button.parentElement
    expect(container).toHaveClass('flex', 'items-center', 'justify-center')
  })

  it('ボタンテキストが正しく表示される', () => {
    const mockReset = vi.fn()
    render(<ErrorResetButton resetErrorBoundary={mockReset} />)

    const button = screen.getByRole('button', { name: 'Try again' })
    expect(button).toHaveTextContent('Try again')
  })

  it('複数回クリックしても正常に動作する', async () => {
    const mockReset = vi.fn()
    render(<ErrorResetButton resetErrorBoundary={mockReset} />)

    const button = screen.getByRole('button', { name: 'Try again' })

    await fireEvent.click(button)
    await fireEvent.click(button)
    await fireEvent.click(button)

    expect(mockReset).toHaveBeenCalledTimes(3)
  })
})
