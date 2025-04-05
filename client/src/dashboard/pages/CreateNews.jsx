import React, { useRef, useContext, useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { FaImage } from "react-icons/fa";
import { MdCloudUpload } from "react-icons/md";
import JoditEditor from 'jodit-react';
import Galler from '../components/Galler';
import { base_url } from '../../config/config'
import axios from 'axios'
import storeContext from '../../context/storeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const CreateNews = () => {

  const navigate = useNavigate()
  const { store } = useContext(storeContext)

  const [show, setShow] = useState(false)
  const editor = useRef(null)

  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [img, setImg] = useState('')
  const [description, setDescription] = useState('')

  const imageHandle = (e) => {
    const { files } = e.target
    if (files.length > 0) {
      setImg(URL.createObjectURL(files[0]))
      setImage(files[0])
    }

  }

  const [loader, setLoader] = useState(false)

  const added = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('title', title)
    formData.append('image', image)
    formData.append('description', description)

    try {
      setLoader(true)
      const { data } = await axios.post(`${base_url}/api/news/add`, formData, {
        headers: {
          'Authorization': `Bearer ${store.token}`
        }
      })
      setLoader(false)
      console.log(data)
      toast.success(data.message)

    } catch (error) {
      setLoader(false)
      toast.error(error.response.data.message)

    }
  }
  const [images, setImages] = useState([])

  const get_image = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/images`, {
        headers: {
          'Authorization': `Bearer ${store.token}`
        }
      })
      setImages(data.images)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    get_image()
  }, [])

  const [imageLoader, setImageLoader] = useState(false)

  const imageHandler = async (e) => {
    e.preventDefault()
    const files = e.target.files
    console.log(files, "files")

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i])
      }

      setImageLoader(true)
      const { data } = await axios.post(`${base_url}/api/images/add`, formData, {
        headers: {
          'Authorization': `Bearer ${store.token}`
        }
      })
      setImageLoader(false)
      setImages([...images, ...data.images])
      toast.success(data.message)

    } catch (error) {
      
      setImageLoader(false)
      toast.error(error.response.data.message)
      console.log(error)
    }

  }

  return (
    <div className=''>

      <div className='bg-white rounded-md'>
        <div className='flex justify-between p-4'>
          <h2 className='text-xl font-medium'>Add News</h2>
          <Link className='px-3 py-[6px] bg-purple-500 rounded-md text-white hover:bg-purple-600' to='/dashboard/news'> News</Link>

        </div>

        <div className='p-4'>
          <form onSubmit={added}>
            <div className='flex flex-col gap-y-2 mb-5'>
              <label className='text-md font-medium text-gray-600' htmlFor='title'>Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} type='text' placeholder='news title' name='title' className='px-3 py-2 rounded-md outline-0 border border-gray-300 focus:border-green-500 h-10' id='title' />
            </div>

            <div className='mb-6'>
              <label className={`w-full h-[320px] flex rounded text-[#404040] justify-center items-center gap-2 cursor-pointer border-2 border-dashed `} htmlFor='img'>
                {
                  img ? <img src={img} alt='' className='h-full w-full' /> : <div className='flex justify-center  items-center flex-col gap-y-2'>
                    <span className='text-2xl'><MdCloudUpload /></span>
                    <span>Select Image</span>
                  </div>
                }
              </label>
              <input required onChange={imageHandle} type='file' id='img' className='hidden' />
            </div>

            <div className='flex flex-col gap-y-2 mb-5'>
              <div className='flex justify-start items-center gap-x-2'>
                <h2 className='text-md font-medium text-gray-600'>Description</h2>
                <div onClick={() => setShow(true)}>
                  <span className='text-2xl'><MdCloudUpload /></span>
                </div>
              </div>

              <div>
                <JoditEditor
                  rafe={editor}
                  value={description}
                  tabIndent={1}
                  onBlur={(value) => setDescription(value)}
                  onChange={() => { }}
                />
              </div>

            </div>

            <div className='mt-2'>
              <button disabled={loader} className='px-3 py-[6px] bg-purple-500 rounded-md text-white hover:bg-purple-600' to='/dashboard/writers'>{loader ? "lodding.." : "Add News"}</button>
            </div>
          </form>
        </div>

      </div>

      <input onChange={imageHandler} type="file" multiple id='images' className="hidden" />

      {
        show && <Galler setShow={setShow} images={images} />
      }
    </div>
  )
}

export default CreateNews