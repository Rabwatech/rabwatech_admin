'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  country?: string
  status: 'active' | 'inactive'
  lead_status?: string
  lead_score?: number
  lead_source?: string
  created_at: string
  updated_at: string
}

interface LeadsTableProps {
  leads: Lead[]
  onDelete?: (id: string) => void
}

export function LeadsTable({ leads, onDelete }: LeadsTableProps) {
  const getLeadStatusBadge = (status?: string) => {
    if (!status) return null
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      new: { label: 'جديد', variant: 'outline' },
      contacted: { label: 'تم التواصل', variant: 'secondary' },
      qualified: { label: 'مؤهل', variant: 'default' },
      converted: { label: 'محول', variant: 'default' },
      lost: { label: 'مفقود', variant: 'destructive' },
    }
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>الدولة</TableHead>
            <TableHead>المصدر</TableHead>
            <TableHead>حالة المبيعات</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                لا توجد زبائن محتملين
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone || '-'}</TableCell>
                <TableCell>{lead.country || '-'}</TableCell>
                <TableCell>{lead.lead_source || '-'}</TableCell>
                <TableCell>
                  {getLeadStatusBadge(lead.lead_status) || (
                    <Badge variant="secondary">-</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={lead.status === 'active' ? 'default' : 'secondary'}>
                    {lead.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ar })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/leads/${lead.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>عرض</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/leads/${lead.id}`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>تعديل</span>
                        </Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(lead.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

