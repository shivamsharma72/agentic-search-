import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { report, filename, format } = await req.json();

    if (!report || !filename) {
      return NextResponse.json(
        { error: 'Report content and filename are required' },
        { status: 400 }
      );
    }

    // For Markdown format
    if (format === 'markdown' || !format) {
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}.md"`,
        },
      });
    }

    // For plain text format
    if (format === 'txt') {
      return new NextResponse(report, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${filename}.txt"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Unsupported format. Use "markdown" or "txt"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}

