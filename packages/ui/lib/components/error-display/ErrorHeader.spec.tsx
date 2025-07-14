import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorHeader } from './ErrorHeader'

describe('ErrorHeader', () => {
  it('警告アイコンが表示される', () => {
    render(<ErrorHeader />)

    const warningIcon = screen.getByLabelText('Warning icon')
    expect(warningIcon).toBeInTheDocument()
    expect(warningIcon).toHaveClass('mx-auto', 'h-24', 'w-24', 'text-red-500')
  })

  it('エラー情報のタイトルが表示される', () => {
    render(<ErrorHeader />)

    const title = screen.getByRole('heading', { level: 2 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Something went wrong')
    expect(title).toHaveClass('mt-6', 'text-3xl', 'font-extrabold', 'text-gray-900')
  })

  it('エラー説明文が表示される', () => {
    render(<ErrorHeader />)

    const description = screen.getByText('Please try again later.')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('mt-2', 'text-sm', 'text-gray-600')
  })

  it('中央寄せのレイアウトが適用される', () => {
    render(<ErrorHeader />)

    const container = screen.getByText('Something went wrong').closest('div')
    expect(container).toHaveClass('text-center')
  })

  it('警告アイコンのタイトルが設定される', () => {
    render(<ErrorHeader />)

    const title = screen.getByTitle('Warning')
    expect(title).toBeInTheDocument()
  })

  it('警告アイコンのSVGプロパティが正しく設定される', () => {
    render(<ErrorHeader />)

    const warningIcon = screen.getByLabelText('Warning icon')
    expect(warningIcon).toHaveAttribute('fill', 'none')
    expect(warningIcon).toHaveAttribute('viewBox', '0 0 24 24')
    expect(warningIcon).toHaveAttribute('stroke', 'currentColor')
  })

  it('警告アイコンのパスが正しく設定される', () => {
    render(<ErrorHeader />)

    const path = screen.getByLabelText('Warning icon').querySelector('path')
    expect(path).toHaveAttribute('strokeLinecap', 'round')
    expect(path).toHaveAttribute('strokeLinejoin', 'round')
    expect(path).toHaveAttribute('strokeWidth', '2')
    expect(path).toHaveAttribute(
      'd',
      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    )
  })
})
