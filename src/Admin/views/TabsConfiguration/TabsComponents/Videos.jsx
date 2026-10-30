import {useEffect, useState} from 'react' 
import {useNavigate, useLocation} from 'react-router-dom'
import VideoLayout from './VideoLayout'
import {useDispatch, useSelector} from 'react-redux'
import {getAdminMedia} from '../../../../redux/actions'
import YouTubeVideoView from '../../EditVideos/YouTubeVideoView'
import InstVideoView from '../../EditVideos/InstVideoView'
import FaceVideoView from '../../EditVideos/FaceVideoView'

const Videos = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

const media = useSelector((state)=>state.MediaAd)

// Lee el parámetro "tab" de la URL. Si no existe, usa un valor predeterminado.
const queryParams = new URLSearchParams(location.search);
const initialTab = queryParams.get('subtab') || 'facebook';

const [activeTab, setActiveTab] = useState(initialTab);
  

const handleTabChange = (activeTab) => {
  navigate(`/admin?tab=videos&subtab=${activeTab}`); // Actualiza la URL.
  setActiveTab(activeTab);
};
useEffect(()=>{
  dispatch(getAdminMedia())
},[])

  return (
      <section className="container-fluid">
      
        <h2 className="fw-light">Gestion de contenido multimedia:</h2>
        <VideoLayout
      activeTab={activeTab}
      handleTabChange={handleTabChange}
    >
      {activeTab === 'facebook' && (
        <FaceVideoView media={media}/>
      )}
      {activeTab === 'instagram' && (
        <InstVideoView media={media}/>
      )}
      {activeTab === 'youtube' && (
        <YouTubeVideoView media={media}/>
      )}
    </VideoLayout>
  </section>
  )
}

export default Videos
 