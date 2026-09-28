import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentSitter } from "../../../../modules/sitter/sitter.service";
export async function PUT(request){const sitter=await getCurrentSitter();if(!sitter)return NextResponse.json({success:false,error:"Sitter access is required."},{status:401});const body=await request.json().catch(()=>null);if(!body||typeof body.notificationsEnabled!=="boolean")return NextResponse.json({success:false,error:"A notification preference is required."},{status:400});await prisma.pet_sitter.update({where:{sitter_id:sitter.sitter_id},data:{notifications_enabled:body.notificationsEnabled}});return NextResponse.json({success:true,data:{notificationsEnabled:body.notificationsEnabled}})}
