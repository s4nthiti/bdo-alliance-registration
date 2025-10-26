import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllMessageTemplates, 
  getMessageTemplateById, 
  getDefaultMessageTemplate,
  createMessageTemplate, 
  updateMessageTemplate, 
  deleteMessageTemplate,
  setDefaultMessageTemplate 
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const defaultOnly = searchParams.get('default') === 'true';

    if (id) {
      const template = await getMessageTemplateById(id);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    if (defaultOnly) {
      const template = await getDefaultMessageTemplate();
      return NextResponse.json(template);
    }

    const templates = await getAllMessageTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content, is_default = false } = body;

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const template = await createMessageTemplate({ name, content, is_default });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating message template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, content, is_default, set_as_default } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    if (set_as_default) {
      await setDefaultMessageTemplate(id);
      const template = await getMessageTemplateById(id);
      return NextResponse.json(template);
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (content !== undefined) updates.content = content;
    if (is_default !== undefined) updates.is_default = is_default;

    const template = await updateMessageTemplate(id, updates);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating message template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await deleteMessageTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
