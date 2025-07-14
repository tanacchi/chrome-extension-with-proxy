import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToggleButton } from './ToggleButton'
import '../../../../test-utils/global-types'

describe('ToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ライトテーマでボタンが正しく表示される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<ToggleButton>Toggle Theme</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Toggle Theme' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('border-black', 'bg-white', 'text-black')
    expect(button).not.toHaveClass('border-white', 'bg-black', 'text-white')
  })

  it('ダークテーマでボタンが正しく表示される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: false })

    render(<ToggleButton>Toggle Theme</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Toggle Theme' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('border-white', 'bg-black', 'text-white')
    expect(button).not.toHaveClass('border-black', 'bg-white', 'text-black')
  })

  it('ボタンクリックでテーマが切り替わる', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<ToggleButton>Toggle Theme</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Toggle Theme' })
    await fireEvent.click(button)

    expect(globalThis.mockToggle).toHaveBeenCalledOnce()
  })

  it('基本的なボタンスタイルが適用される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<ToggleButton>Test Button</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toHaveClass(
      'mt-4',
      'rounded',
      'border-2',
      'px-4',
      'py-1',
      'font-bold',
      'shadow',
      'hover:scale-105',
    )
  })

  it('カスタムclassNameが適用される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<ToggleButton className="custom-class">Test Button</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toHaveClass('custom-class')
  })

  it('追加のpropsが正しく渡される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(
      <ToggleButton data-testid="toggle-button" disabled>
        Test Button
      </ToggleButton>,
    )

    const button = screen.getByTestId('toggle-button')
    expect(button).toBeDisabled()
  })

  it('子要素が正しく表示される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(
      <ToggleButton>
        <span>Icon</span>
        <span>Text</span>
      </ToggleButton>,
    )

    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('テーマ状態の変更を正しく反映する', () => {
    const { rerender } = render(<ToggleButton>Toggle Theme</ToggleButton>)

    // ライトテーマの場合
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    rerender(<ToggleButton>Toggle Theme</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Toggle Theme' })
    expect(button).toHaveClass('border-black', 'bg-white', 'text-black')

    // ダークテーマの場合
    globalThis.mockUseStorage.mockReturnValue({ isLight: false })
    rerender(<ToggleButton>Toggle Theme</ToggleButton>)

    expect(button).toHaveClass('border-white', 'bg-black', 'text-white')
  })

  it('ボタンのtype属性がデフォルトで設定される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<ToggleButton>Test Button</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toHaveAttribute('type', 'button')
  })

  it('カスタムtype属性が適用される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<ToggleButton type="submit">Submit Button</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Submit Button' })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('undefinedのisLightでもダークテーマが適用される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: undefined })

    render(<ToggleButton>Toggle Theme</ToggleButton>)

    const button = screen.getByRole('button', { name: 'Toggle Theme' })
    expect(button).toHaveClass('border-white', 'bg-black', 'text-white')
  })
})
