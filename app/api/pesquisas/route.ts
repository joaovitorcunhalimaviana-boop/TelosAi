import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';

// ============================================
// GET - LIST ALL RESEARCH STUDIES
// ============================================

export async function GET(request: NextRequest) {
  try {
    // TODO: Pegar userId da session
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     buildErrorResponse('Unauthorized', 'You must be logged in'),
    //     { status: 401 }
    //   )
    // }
    // const userId = session.user.id
    const userId = 'temp-user-id'; // Temporário

    // Get all research studies for this user
    const researches = await prisma.research.findMany({
      where: {
        userId,
      },
      include: {
        groups: {
          orderBy: {
            groupCode: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: researches,
    });
  } catch (error) {
    console.error('Error listing research:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to list research',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// POST - CREATE NEW RESEARCH STUDY
// ============================================

export async function POST(request: NextRequest) {
  try {
    // TODO: Pegar userId da session
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     buildErrorResponse('Unauthorized', 'You must be logged in'),
    //     { status: 401 }
    //   )
    // }
    // const userId = session.user.id
    const userId = 'temp-user-id'; // Temporário
    const body = await request.json();

    // Validation
    if (!body.title || !body.description) {
      return NextResponse.json(
        buildErrorResponse(
          'Validation error',
          'Title and description are required'
        ),
        { status: 400 }
      );
    }

    if (!body.groups || !Array.isArray(body.groups) || body.groups.length === 0) {
      return NextResponse.json(
        buildErrorResponse(
          'Validation error',
          'At least one research group is required'
        ),
        { status: 400 }
      );
    }

    // Validate groups
    for (const group of body.groups) {
      if (!group.groupCode || !group.groupName || !group.description) {
        return NextResponse.json(
          buildErrorResponse(
            'Validation error',
            'Each group must have code, name, and description'
          ),
          { status: 400 }
        );
      }
    }

    // Create research with groups and protocols
    const research = await prisma.research.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        surgeryType: body.surgeryType || null,
        isActive: true,
        groups: {
          create: body.groups.map((group: any) => ({
            groupCode: group.groupCode,
            groupName: group.groupName,
            description: group.description,
          })),
        },
        protocols: body.protocols && Array.isArray(body.protocols) && body.protocols.length > 0 ? {
          create: body.protocols.map((protocol: any) => ({
            userId,
            surgeryType: protocol.surgeryType,
            category: protocol.category,
            title: protocol.title,
            dayRangeStart: protocol.dayRangeStart,
            dayRangeEnd: protocol.dayRangeEnd || null,
            content: protocol.content,
            priority: protocol.priority || 0,
            isActive: true,
            researchGroupCode: protocol.researchGroupCode || null, // null = todos os grupos
          })),
        } : undefined,
      },
      include: {
        groups: {
          orderBy: {
            groupCode: 'asc',
          },
        },
        protocols: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Research created successfully',
        data: research,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating research:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to create research',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - UPDATE RESEARCH STATUS
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    // TODO: Pegar userId da session
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     buildErrorResponse('Unauthorized', 'You must be logged in'),
    //     { status: 401 }
    //   )
    // }
    // const userId = session.user.id
    const userId = 'temp-user-id'; // Temporário
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        buildErrorResponse('Validation error', 'Research ID is required'),
        { status: 400 }
      );
    }

    // Verify ownership
    const research = await prisma.research.findFirst({
      where: {
        id: body.id,
        userId,
      },
    });

    if (!research) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Research not found'),
        { status: 404 }
      );
    }

    // Update research
    const updated = await prisma.research.update({
      where: {
        id: body.id,
      },
      data: {
        isActive: body.isActive,
        endDate: body.isActive === false && !research.endDate ? new Date() : research.endDate,
      },
      include: {
        groups: {
          orderBy: {
            groupCode: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Research updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating research:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to update research',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
