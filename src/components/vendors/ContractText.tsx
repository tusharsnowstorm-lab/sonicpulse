import type { ContractBlock } from '@/data/vendor-contract'

export default function ContractText({ blocks }: { blocks: ContractBlock[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {blocks.map((block, i) => {
        if (block.type === 'title') {
          return (
            <p
              key={i}
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#fff',
                margin: '4px 0',
              }}
            >
              {block.text}
            </p>
          )
        }

        if (block.type === 'heading') {
          return (
            <h4
              key={i}
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                marginTop: 22,
                marginBottom: 4,
              }}
            >
              {block.text}
            </h4>
          )
        }

        if (block.type === 'p') {
          return (
            <p key={i} style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.7, margin: '4px 0' }}>
              {block.text}
            </p>
          )
        }

        if (block.type === 'table') {
          return (
            <table key={i} style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0' }}>
              <tbody>
                {block.rows.map(([label, value], j) => (
                  <tr key={j} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td
                      style={{
                        width: '38%',
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        color: 'var(--text-label-muted)',
                        verticalAlign: 'top',
                        padding: '8px 10px 8px 0',
                        wordBreak: 'break-word',
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        fontSize: 13,
                        color: '#fff',
                        verticalAlign: 'top',
                        padding: '8px 0',
                        wordBreak: 'break-word',
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }

        return (
          <ul key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '4px 0', paddingLeft: 0, listStyle: 'none' }}>
            {block.items.map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--accent-magenta)', marginTop: 1 }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      })}
    </div>
  )
}
