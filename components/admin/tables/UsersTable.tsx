'use client'

import { useState } from 'react'
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

interface User {
  id: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  is_active: boolean
  last_login?: string
  created_at: string
}

interface UsersTableProps {
  users: User[]
  onDelete?: (id: string) => void
}

export function UsersTable({ users, onDelete }: UsersTableProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'moderator':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>آخر تسجيل دخول</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                لا توجد مستخدمين
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role === 'admin'
                      ? 'مسؤول'
                      : user.role === 'moderator'
                      ? 'مشرف'
                      : 'مستخدم'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.last_login
                    ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm', {
                        locale: ar,
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ar })}
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
                        <Link href={`/admin/users/${user.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>عرض</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>تعديل</span>
                        </Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(user.id)}
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

