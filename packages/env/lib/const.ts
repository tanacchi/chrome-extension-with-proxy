export const IS_DEV = process.env.CLI_CEB_DEV === 'true'
export const IS_PROD = !IS_DEV
export const IS_FIREFOX = process.env.CLI_CEB_FIREFOX === 'true'
export const IS_CI = process.env.CEB_CI === 'true'
export const E2E_HEADED = process.env.CEB_E2E_HEADED === 'true'
