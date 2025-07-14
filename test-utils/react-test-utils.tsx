import { render, type RenderOptions } from '@testing-library/react'
import { type ReactElement, Suspense } from 'react'
import { setupChromeMock } from './chrome-mock'

/**
 * カスタムレンダー関数の設定
 */
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * React コンポーネントのテスト用セットアップ
 */
export const setupReactTest = () => {
  const chromeMock = setupChromeMock()

  return {
    ...chromeMock,
    render: customRender,
    cleanup: () => {
      chromeMock.cleanup()
    },
  }
}

export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
export { render as customRender }
