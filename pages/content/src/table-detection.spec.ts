import { detectTargetTable, extractTableData } from './table-detection'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Table Detection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('detectTargetTable', () => {
    it('should detect table with ai-target-table-table class', () => {
      document.body.innerHTML = `
        <div>
          <table class="ai-target-table-table">
            <tbody>
              <tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr>
              <tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr>
            </tbody>
          </table>
        </div>
      `

      const table = detectTargetTable()
      expect(table).not.toBeNull()
      expect(table?.classList.contains('ai-target-table-table')).toBe(true)
    })

    it('should return null when no target table exists', () => {
      document.body.innerHTML = `
        <div>
          <table class="other-table">
            <tbody>
              <tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr>
            </tbody>
          </table>
        </div>
      `

      const table = detectTargetTable()
      expect(table).toBeNull()
    })

    it('should return first table when multiple target tables exist', () => {
      document.body.innerHTML = `
        <div>
          <table class="ai-target-table-table" id="first">
            <tbody>
              <tr><td>First</td><td>Table</td></tr>
            </tbody>
          </table>
          <table class="ai-target-table-table" id="second">
            <tbody>
              <tr><td>Second</td><td>Table</td></tr>
            </tbody>
          </table>
        </div>
      `

      const table = detectTargetTable()
      expect(table).not.toBeNull()
      expect(table?.id).toBe('first')
    })

    it('should handle table without tbody', () => {
      document.body.innerHTML = `
        <div>
          <table class="ai-target-table-table">
            <tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr>
            <tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr>
          </table>
        </div>
      `

      const table = detectTargetTable()
      expect(table).not.toBeNull()
      expect(table?.classList.contains('ai-target-table-table')).toBe(true)
    })
  })

  describe('extractTableData', () => {
    it('should extract data from second column of tbody rows', () => {
      const table = document.createElement('table')
      table.innerHTML = `
        <tbody>
          <tr><td>Row 1 Col 1</td><td>Data 1</td><td>Row 1 Col 3</td></tr>
          <tr><td>Row 2 Col 1</td><td>Data 2</td><td>Row 2 Col 3</td></tr>
          <tr><td>Row 3 Col 1</td><td>Data 3</td><td>Row 3 Col 3</td></tr>
        </tbody>
      `

      const data = extractTableData(table)
      expect(data).toEqual(['Data 1', 'Data 2', 'Data 3'])
    })

    it('should extract data from second column when no tbody', () => {
      const table = document.createElement('table')
      table.innerHTML = `
        <tr><td>Row 1 Col 1</td><td>Data 1</td><td>Row 1 Col 3</td></tr>
        <tr><td>Row 2 Col 1</td><td>Data 2</td><td>Row 2 Col 3</td></tr>
      `

      const data = extractTableData(table)
      expect(data).toEqual(['Data 1', 'Data 2'])
    })

    it('should exclude empty rows', () => {
      const table = document.createElement('table')
      table.innerHTML = `
        <tbody>
          <tr><td>Row 1 Col 1</td><td>Data 1</td></tr>
          <tr><td>Row 2 Col 1</td><td></td></tr>
          <tr><td>Row 3 Col 1</td><td>Data 3</td></tr>
          <tr><td>Row 4 Col 1</td><td>   </td></tr>
        </tbody>
      `

      const data = extractTableData(table)
      expect(data).toEqual(['Data 1', 'Data 3'])
    })

    it('should handle rows with less than 2 columns', () => {
      const table = document.createElement('table')
      table.innerHTML = `
        <tbody>
          <tr><td>Row 1 Col 1</td><td>Data 1</td></tr>
          <tr><td>Row 2 Col 1</td></tr>
          <tr><td>Row 3 Col 1</td><td>Data 3</td></tr>
        </tbody>
      `

      const data = extractTableData(table)
      expect(data).toEqual(['Data 1', 'Data 3'])
    })

    it('should return empty array for empty table', () => {
      const table = document.createElement('table')
      table.innerHTML = '<tbody></tbody>'

      const data = extractTableData(table)
      expect(data).toEqual([])
    })

    it('should handle table without any rows', () => {
      const table = document.createElement('table')

      const data = extractTableData(table)
      expect(data).toEqual([])
    })

    it('should trim whitespace from extracted data', () => {
      const table = document.createElement('table')
      table.innerHTML = `
        <tbody>
          <tr><td>Row 1</td><td>  Data 1  </td></tr>
          <tr><td>Row 2</td><td>\n\tData 2\n\t</td></tr>
        </tbody>
      `

      const data = extractTableData(table)
      expect(data).toEqual(['Data 1', 'Data 2'])
    })
  })
})
