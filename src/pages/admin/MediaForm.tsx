import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Button, Upload, message, Divider, Grid } from 'antd'
import { Plus, Trash2, UploadCloud, X } from 'lucide-react'
import { mediaApi, uploadApi } from '../../api'
import type { MediaItem, GalleryItem } from '../../types'

// Đoán loại nội dung theo đuôi URL (cho trường hợp dán URL trực tiếp)
function guessType(url: string): 'image' | 'video' {
  return /\.(mp4|webm|mov|m4v|avi|mkv)(\?|$)/i.test(url) ? 'video' : 'image'
}

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
  const [mediaList, setMediaList] = useState<GalleryItem[]>([]) // ⭐ nhiều ảnh/video
  const [urlInput, setUrlInput] = useState('')
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
        // dữ liệu mới (media[]) hoặc cũ (mediaUrl) đều nạp được
        const list = item.media?.length
          ? item.media
          : item.mediaUrl
          ? [{ type: item.type, url: item.mediaUrl }]
          : []
        setMediaList(list)
        setThumbnailUrl(item.thumbnailUrl || '')
      } else {
        form.resetFields()
        form.setFieldsValue({
          isPublished: true,
          pinned: false,
          affiliateLinks: [{ label: 'Shopee', url: '' }],
        })
        setMediaList([])
        setThumbnailUrl('')
      }
      setUrlInput('')
    }
  }, [open, item])

  // Upload TỪNG file nội dung → thêm vào gallery (gọi mỗi file 1 lần, chọn nhiều cũng chạy hết)
  const doUploadOne = async (file: File) => {
    setUploadingMedia(true)
    try {
      const res = await uploadApi.file(file)
      setMediaList((prev) => [...prev, { type: res.type, url: res.url }])
      // tự lấy ảnh đầu tiên làm thumbnail nếu chưa có
      setThumbnailUrl((t) => t || (res.type === 'image' ? res.url : t))
    } catch (e: any) {
      message.error(`${file.name}: ${e.response?.data?.message || 'tải lên thất bại'}`)
    } finally {
      setUploadingMedia(false)
    }
  }

  const doUploadThumb = async (file: File) => {
    setUploadingThumb(true)
    try {
      const res = await uploadApi.file(file)
      setThumbnailUrl(res.url)
      message.success('Đã tải ảnh xem trước')
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Tải lên thất bại')
    } finally {
      setUploadingThumb(false)
    }
  }

  const addUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    setMediaList((prev) => [...prev, { type: guessType(url), url }])
    setUrlInput('')
  }

  const removeMedia = (idx: number) => setMediaList((prev) => prev.filter((_, i) => i !== idx))

  const onSubmit = async () => {
    const v = await form.validateFields()
    if (mediaList.length === 0) return message.error('Hãy thêm ít nhất 1 ảnh hoặc video')
    const payload: any = {
      ...v,
      media: mediaList,
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

        <Form.Item name="tags" label="Tags">
          <Select mode="tags" placeholder="mỹ-phẩm, hot, sale..." tokenSeparators={[',']} />
        </Form.Item>

        {/* Nội dung: NHIỀU ảnh/video */}
        <div className="mb-3">
          <div className="text-sm mb-1 font-medium">
            Ảnh / Video <span className="text-red-500">*</span>{' '}
            <span className="text-gray-400 font-normal">(chọn được nhiều file)</span>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Upload
              showUploadList={false}
              multiple
              accept="image/*,video/*"
              beforeUpload={(file) => {
                // gọi cho TỪNG file được chọn → thêm hết vào gallery
                doUploadOne(file as File)
                return Upload.LIST_IGNORE
              }}
            >
              <Button icon={<UploadCloud size={16} />} loading={uploadingMedia}>
                Tải lên (nhiều)
              </Button>
            </Upload>
            <span className="text-xs text-gray-400">{mediaList.length} file</span>
          </div>

          {/* Thêm bằng URL */}
          <div className="flex gap-2 mt-2">
            <Input
              size="small"
              placeholder="hoặc dán URL ảnh/video rồi bấm Thêm"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault()
                addUrl()
              }}
            />
            <Button size="small" onClick={addUrl}>Thêm</Button>
          </div>

          {/* Lưới xem trước + xoá + kéo đổi thứ tự bằng nút */}
          {mediaList.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
              {mediaList.map((m, i) => (
                <div key={i} className="relative aspect-square rounded border overflow-hidden bg-gray-100">
                  {m.type === 'video' ? (
                    <div className="w-full h-full grid place-items-center text-2xl">🎬</div>
                  ) : (
                    <img src={m.url} className="w-full h-full object-cover" />
                  )}
                  {i === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center">
                      Bìa/Chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ảnh bìa (thumbnail) — để trống sẽ tự dùng ảnh đầu tiên */}
        <div className="mb-1">
          <div className="text-sm mb-1">
            Ảnh xem trước / bìa <span className="text-gray-400">(để trống = tự dùng ảnh đầu tiên)</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(f) => {
                doUploadThumb(f as File)
                return false
              }}
            >
              <Button icon={<UploadCloud size={16} />} loading={uploadingThumb}>Tải ảnh bìa</Button>
            </Upload>
            {thumbnailUrl && <img src={thumbnailUrl} className="w-14 h-14 object-cover rounded border" />}
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
