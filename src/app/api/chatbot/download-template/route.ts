import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const wb = XLSX.utils.book_new()

    const template = [
      { Question: 'What are your business hours?', Answer: 'We are open Monday to Friday 9am to 6pm', Category: 'General' },
      { Question: 'What services do you offer?', Answer: 'We offer Digital PR, SEO, Social Media Marketing, Web Development, and more.', Category: 'Services' },
      { Question: 'How can I contact support?', Answer: 'You can email us at marketing@digisharkscommunications.com or call +91 96273 32332', Category: 'Support' },
    ]

    const ws = XLSX.utils.json_to_sheet(template)

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 40 },
      { wch: 60 },
      { wch: 20 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Q&A Template')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="chatbot-qa-template.xlsx"',
      },
    })
  } catch (err) {
    console.error('Download template error:', err)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}
