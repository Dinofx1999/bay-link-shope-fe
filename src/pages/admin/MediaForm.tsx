import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Button, Upload, message, Divider, Grid } from 'antd'
import { Plus, Trash2, UploadCloud } from 'lucide-react'
import { mediaApi, uploadApi } from '../../api'
import type { MediaItem } from '../../types'

export default function MediaForm({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean
  item: MediaItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const screens = Grid.useBreakpoint()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  useEffect(() => {
    if (open) {
      if (item) {
        form.setFieldsValue({
          ...item,
          tags: item.tags || [],
          affiliateLinks: item.affiliateLinks?.length ? item.affiliateLinks : [{ label: '', url: '' }],
        })
        setMediaUrl(item.mediaUrl || '')
        setThumbnailUrl(item.thumbnailUrl || '')
      } else {
        form.resetFields()
        form.setFieldsValue({
          type: 'image',
          isPublished: true,
          pinned: false,
          affiliateLinks: [{ label: 'Shopee', url: '' }],
        })
        setMediaUrl('')
        setThumbnailUrl('')
      }
    }
  }, [open, item])

  const doUpload = async (file: File, kind: 'media' | 'thumb') => {
    const setU = kind === 'media' ? setUploadingMedia : setUploadingThumb
    setU(true)
    try {
      const res = await uploadApi.file(file)
      if (kind === 'media') {
        setMediaUrl(res.url)
        // tự đoán loại theo file
        form.setFieldValue('type', res.type)
        if (!thumbnailUrl && res.type === 'image') setThumbnailUrl(res.url)
      } else {
        setThumbnailUrl(res.url)
      }
      message.success('Tải lên thành công')
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Tải lên thất bại')
    } finally {
      setU(false)
    }
    return false
  }

  const onSubmit = async () => {
    const v = await form.validateFields()
    if (!mediaUrl) return message.error('Hãy tải lên hoặc dán URL nội dung (clip/ảnh)')
    const payload: any = {
      ...v,
      mediaUrl,
      thumbnailUrl,
      affiliateLinks: (v.affiliateLinks || []).filter((l: any) => l && l.url),
    }
    setSaving(true)
    try {
      if (item) await mediaApi.update(item._id, payload)
      else await mediaApi.create(payload)
      message.success('Đã lưu')
      onSaved()
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={item ? 'Sửa nội dung' : 'Thêm nội dung'}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={saving}
      okText="Lưu"
      cancelText="Huỷ"
      width={screens.md ? 640 : '94%'}
      style={{ top: screens.md ? 100 : 16, maxWidth: 'calc(100vw - 16px)' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
          <Input placeholder="VD: Son kem lì giá rẻ mà đẹp xỉu" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} placeholder="Mô tả ngắn hiển thị khi mở khoá" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item name="type" label="Loại nội dung">
            <Select
              options={[
                { value: 'image', label: '🖼️ Ảnh' },
                { value: 'video', label: '🎬 Video / Clip' },
              ]}
            />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="mỹ-phẩm, hot, sale..." tokenSeparators={[',']} />
          </Form.Item>
        </div>

        {/* Upload nội dung */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm mb-1">Nội dung (clip/ảnh) <span className="text-red-500">*</span></div>
            <Upload showUploadList={false} beforeUpload={(f) => doUpload(f as File, 'media')} accept="image/*,video/*">
              <Button icon={<UploadCloud size={16} />} loading={uploadingMedia}>Tải lên</Button>
            </Upload>
            {mediaUrl && <div className="text-xs text-green-600 mt-1 break-all">✓ {mediaUrl}</div>}
            <Input
              className="mt-1"
              size="small"
              placeholder="hoặc dán URL trực tiếp"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
          <div>
            <div className="text-sm mb-1">Ảnh xem trước (thumbnail)</div>
            <Upload showUploadList={false} beforeUpload={(f) => doUpload(f as File, 'thumb')} accept="image/*">
              <Button icon={<UploadCloud size={16} />} loading={uploadingThumb}>Tải lên</Button>
            </Upload>
            {thumbnailUrl && <img src={thumbnailUrl} className="mt-1 w-16 h-16 object-cover rounded border" />}
          </div>
        </div>

        <Divider orientation="left" className="!text-sm">Link affiliate (để mở khoá)</Divider>
        <Form.List name="affiliateLinks">
          {(fields, { add, remove }) => (
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.key} className="flex items-start gap-2">
                  <Form.Item name={[field.name, 'label']} className="!mb-0 w-24 sm:w-32 shrink-0">
                    <Input placeholder="Tên sàn" />
                  </Form.Item>
                  <Form.Item name={[field.name, 'url']} className="!mb-0 flex-1 min-w-0">
                    <Input placeholder="https://shopee.vn/..." />
                  </Form.Item>
                  <Button danger type="text" icon={<Trash2 size={16} />} onClick={() => remove(field.name)} />
                </div>
              ))}
              <Button type="dashed" block icon={<Plus size={16} />} onClick={() => add({ label: '', url: '' })}>
                Thêm link affiliate
              </Button>
            </div>
          )}
        </Form.List>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <Form.Item name="isPublished" label="Hiển thị công khai" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="pinned" label="Ghim (HOT)" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
