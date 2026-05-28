import { Resend } from 'resend'
import { PrismaClient } from '@prisma/client'
import type { RsvpInput } from '../validation/rsvpSchema'

const resend = new Resend(process.env.RESEND_API_KEY)
const prisma = new PrismaClient()

const DIETARY_LABEL: Record<string, string> = {
  regular: '葷食',
  vegetarian: '素食',
}
const SIDE_LABEL: Record<string, string> = { groom: '新郎方', bride: '新娘方' }
const REL_LABEL: Record<string, string> = { relative: '親屬', friend: '朋友' }

function toTaipeiTime(date: Date): string {
  return date.toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export async function sendAdminNotification(
  id: number,
  data: RsvpInput,
  createdAt: Date,
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const html = `
    <h2>新 RSVP 回覆通知</h2>
    <table border="1" cellpadding="8" style="border-collapse:collapse;">
      <tr><td>RSVP ID</td><td>${id}</td></tr>
      <tr><td>姓名</td><td>${data.name}</td></tr>
      <tr><td>電話</td><td>${data.phone}</td></tr>
      <tr><td>出席狀態</td><td>${data.attending ? '出席' : '不克出席'}</td></tr>
      <tr><td>大人人數</td><td>${data.adultCount ?? '—'}</td></tr>
      <tr><td>小孩人數</td><td>${data.childCount ?? '—'}</td></tr>
      <tr><td>兒童椅</td><td>${data.needsHighchair === true ? '需要' : data.needsHighchair === false ? '不需要' : '—'}</td></tr>
      <tr><td>賓桌歸屬</td><td>${data.relationshipSide ? SIDE_LABEL[data.relationshipSide] : '未填寫'}</td></tr>
      <tr><td>關係類型</td><td>${data.relationshipType ? REL_LABEL[data.relationshipType] : '未填寫'}</td></tr>
      <tr><td>飲食偏好</td><td>${DIETARY_LABEL[data.dietaryPreference ?? 'regular']}</td></tr>
      <tr><td>紙本喜帖</td><td>${data.needsInvitation ? '需要' : '不需要'}</td></tr>
      ${data.needsInvitation ? `
      <tr><td>收件人</td><td>${data.invitationName ?? ''}</td></tr>
      <tr><td>收件電話</td><td>${data.invitationPhone ?? ''}</td></tr>
      <tr><td>收件地址</td><td>${data.invitationAddress ?? ''}</td></tr>
      ` : ''}
      <tr><td>提交時間</td><td>${toTaipeiTime(createdAt)} (UTC+8)</td></tr>
    </table>
  `

  try {
    const { error } = await resend.emails.send({
      from: 'noreply@hezhouwedding.com',
      to: adminEmail,
      subject: `[婚禮 RSVP] 新回覆：${data.name} (${data.attending ? '出席' : '不克出席'})`,
      html,
    })
    if (error) throw error
    await prisma.rSVPSubmission.update({
      where: { id },
      data: { notificationEmailSent: true, notificationEmailSentAt: new Date() },
    })
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null
          ? JSON.stringify(err)
          : String(err)
    await prisma.rSVPSubmission.update({
      where: { id },
      data: { notificationEmailError: message },
    })
  }
}
