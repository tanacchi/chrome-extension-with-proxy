import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('デフォルトのスピナーが正しく表示される', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('data-size', '100')
    expect(spinner).toHaveAttribute('data-color', 'aqua')
  })

  it('カスタムサイズが正しく適用される', () => {
    const customSize = 50
    render(<LoadingSpinner size={customSize} />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toHaveAttribute('data-size', customSize.toString())
  })

  it('スピナーが中央に配置される', () => {
    render(<LoadingSpinner />)

    const container = screen.getByTestId('ring-loader').parentElement
    expect(container).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center')
  })

  it('サイズが0の場合もデフォルトサイズが適用される', () => {
    render(<LoadingSpinner size={0} />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toHaveAttribute('data-size', '100')
  })

  it('負の数値の場合もデフォルトサイズが適用される', () => {
    render(<LoadingSpinner size={-10} />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toHaveAttribute('data-size', '100')
  })

  it('undefinedの場合もデフォルトサイズが適用される', () => {
    render(<LoadingSpinner size={undefined} />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toHaveAttribute('data-size', '100')
  })

  it('大きなサイズ値でも正しく動作する', () => {
    const largeSize = 999
    render(<LoadingSpinner size={largeSize} />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toHaveAttribute('data-size', largeSize.toString())
  })

  it('色が常にaquaに設定される', () => {
    render(<LoadingSpinner size={50} />)

    const spinner = screen.getByTestId('ring-loader')
    expect(spinner).toHaveAttribute('data-color', 'aqua')
  })
})
