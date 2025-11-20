'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QuestionOption {
  id?: string
  option_text: string
  score_value?: number
}

interface Question {
  id: string
  question_text: string
  question_type: string
  pillar_id: string
  is_active: boolean
  pillars?: {
    id: string
    name: string
  }
  question_options?: QuestionOption[]
}

interface Pillar {
  id: string
  name: string
}

interface QuestionsManagerProps {
  assessmentId: string
  onUpdate?: () => void
}

export function QuestionsManager({ assessmentId, onUpdate }: QuestionsManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPillar, setSelectedPillar] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    pillar_id: '',
    is_active: true,
    options: [] as QuestionOption[],
  })
  const { toast } = useToast()

  useEffect(() => {
    if (assessmentId) {
      fetchPillars()
      fetchQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId])

  useEffect(() => {
    if (assessmentId) {
      fetchQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPillar, assessmentId])

  const fetchPillars = async () => {
    if (!assessmentId) return
    try {
      const response = await fetch(`/api/admin/pillars?assessment_id=${assessmentId}`)
      const data = await response.json()

      if (response.ok) {
        setPillars(data.pillars || [])
      }
    } catch (error) {
      console.error('Error fetching pillars:', error)
    }
  }

  const fetchQuestions = async () => {
    if (!assessmentId) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('assessment_id', assessmentId)
      if (selectedPillar && selectedPillar !== 'all') {
        params.append('pillar_id', selectedPillar)
      }

      const response = await fetch(`/api/admin/assessments/questions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setQuestions(data.questions || [])
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء جلب الأسئلة',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (question?: Question, pillarId?: string) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        pillar_id: question.pillar_id,
        is_active: question.is_active,
        options: question.question_options || [],
      })
    } else {
      setEditingQuestion(null)
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        pillar_id: pillarId || selectedPillar !== 'all' ? selectedPillar : pillars[0]?.id || '',
        is_active: true,
        options: [],
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingQuestion(null)
    setFormData({
      question_text: '',
      question_type: 'multiple_choice',
      pillar_id: '',
      is_active: true,
      options: [],
    })
  }

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { option_text: '', score_value: 0 }],
    })
  }

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    })
  }

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingQuestion
        ? `/api/admin/assessments/questions/${editingQuestion.id}`
        : '/api/admin/assessments/questions'
      const method = editingQuestion ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_text: formData.question_text,
          question_type: formData.question_type,
          pillar_id: formData.pillar_id,
          is_active: formData.is_active,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Handle question options separately if needed
        // For now, we'll just refresh
        toast({
          title: 'نجح',
          description: editingQuestion ? 'تم تحديث السؤال بنجاح' : 'تم إنشاء السؤال بنجاح',
        })
        handleCloseDialog()
        fetchQuestions()
        if (onUpdate) onUpdate()
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حفظ السؤال',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/assessments/questions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'نجح',
          description: 'تم حذف السؤال بنجاح',
        })
        fetchQuestions()
        if (onUpdate) onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: 'خطأ',
          description: data.error || 'حدث خطأ أثناء حذف السؤال',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      multiple_choice: 'اختيار متعدد',
      checkbox: 'خانات اختيار',
      scale: 'مقياس',
      text: 'نص',
    }
    return types[type] || type
  }

  const groupedQuestions = questions.reduce((acc, question) => {
    const pillarId = question.pillar_id
    if (!acc[pillarId]) {
      acc[pillarId] = []
    }
    acc[pillarId].push(question)
    return acc
  }, {} as Record<string, Question[]>)

  const filteredQuestions =
    selectedPillar === 'all'
      ? questions
      : questions.filter((q) => q.pillar_id === selectedPillar)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>الأسئلة</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedPillar} onValueChange={setSelectedPillar}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="جميع الأعمدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأعمدة</SelectItem>
                  {pillars.map((pillar) => (
                    <SelectItem key={pillar.id} value={pillar.id}>
                      {pillar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة سؤال
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">جاري التحميل...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد أسئلة. ابدأ بإضافة سؤال جديد.
            </div>
          ) : (
            <div className="space-y-6">
              {selectedPillar === 'all' ? (
                Object.entries(groupedQuestions).map(([pillarId, pillarQuestions]) => {
                  const pillar = pillars.find((p) => p.id === pillarId)
                  return (
                    <div key={pillarId} className="space-y-2">
                      <h3 className="text-lg font-semibold">{pillar?.name || 'غير معروف'}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">الترتيب</TableHead>
                            <TableHead>السؤال</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead className="text-left">الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pillarQuestions.map((question, qIndex) => (
                            <TableRow key={question.id}>
                              <TableCell>{qIndex + 1}</TableCell>
                              <TableCell className="font-medium">
                                {question.question_text}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getQuestionTypeLabel(question.question_type)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {question.is_active ? (
                                  <Badge className="bg-green-500">نشط</Badge>
                                ) : (
                                  <Badge variant="secondary">غير نشط</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(question)}
                                  >
                                    <Edit className="h-4 w-4 ml-2" />
                                    تعديل
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingQuestion(question)
                                      setDeleteDialogOpen(true)
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">الترتيب</TableHead>
                      <TableHead>السؤال</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question, qIndex) => (
                      <TableRow key={question.id}>
                        <TableCell>{qIndex + 1}</TableCell>
                        <TableCell className="font-medium">{question.question_text}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getQuestionTypeLabel(question.question_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {question.is_active ? (
                            <Badge className="bg-green-500">نشط</Badge>
                          ) : (
                            <Badge variant="secondary">غير نشط</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(question)}
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingQuestion(question)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? 'قم بتعديل معلومات السؤال'
                : 'أدخل معلومات السؤال الجديد'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pillar_id">العمود *</Label>
                <Select
                  value={formData.pillar_id}
                  onValueChange={(value) => setFormData({ ...formData, pillar_id: value })}
                  required
                >
                  <SelectTrigger id="pillar_id">
                    <SelectValue placeholder="اختر العمود" />
                  </SelectTrigger>
                  <SelectContent>
                    {pillars.map((pillar) => (
                      <SelectItem key={pillar.id} value={pillar.id}>
                        {pillar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question_text">نص السؤال *</Label>
                <Textarea
                  id="question_text"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question_type">نوع السؤال</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                  >
                    <SelectTrigger id="question_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">اختيار متعدد</SelectItem>
                      <SelectItem value="checkbox">خانات اختيار</SelectItem>
                      <SelectItem value="scale">مقياس</SelectItem>
                      <SelectItem value="text">نص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                إلغاء
              </Button>
              <Button type="submit">{editingQuestion ? 'تحديث' : 'إنشاء'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingQuestion && handleDelete(editingQuestion.id)}
              className="bg-destructive text-destructive-foreground"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

