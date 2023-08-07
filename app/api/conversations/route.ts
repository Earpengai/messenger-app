import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function POST(
    request: Request
) {
    try {
        const currrentUser = await getCurrentUser();
        const body = await request.json();
        const {
            userId,
            isGroup,
            members,
            name
        } = body;

        if (!currrentUser?.id || !currrentUser?.email) {
            return new NextResponse('Unauthorized', {status: 401});
        }

        if (isGroup && (!members || members.length < 2 || !name)) {
            return new NextResponse('Invalid data', {status: 400});
        }
        
        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    name,
                    isGroup,
                    users: {
                        connect: [
                            ...members.map((member: {value: string}) => ({
                                id: member.value
                            })), 
                            {
                                id: currrentUser.id
                            }
                        ]
                    }
                },
                include: {
                    users: true
                }
            });

            return NextResponse.json(newConversation);
        }

        const existingConversation = await prisma.conversation.findMany({
            where: {
                OR: [
                    {
                        userIds: {
                            equals: [currrentUser.id, userId]
                        }
                    },
                    {
                        userIds: {
                            equals: [userId, currrentUser.id]
                        }
                    }
                ]
            }
        });

        const singleConversation = existingConversation[0];

        if (singleConversation) {
            return NextResponse.json(singleConversation);
        }

        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        {
                            id: currrentUser.id
                        },
                        {
                            id: userId
                        }
                    ]
                }
            },
            include: {
                users: true
            }
        });

        return NextResponse.json(newConversation);
    }
    catch (error: any) {
        return new NextResponse('Internal Error', {status: 500});
    }
}