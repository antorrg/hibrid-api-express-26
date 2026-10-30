import {useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {Link} from 'react-router-dom'
import {getInfo} from '../../../Redux/actions'
import OptimizedImage from '../../../general-components/images/OptimizedImage'


const Portada = () => {
  const dispatch = useDispatch()

  const info = useSelector((state)=>state.Landing)

 useEffect(()=>{
   dispatch(getInfo())
  
 },[])

  return (
    <section className="container">
    <div className=" py-5 row py-lg-5">
      <div className="col-lg-6 col-md-8 col-sm-12 mx-auto text-center">
        <h2 className="fw-light">Gestion de portada:</h2>
        <div className=''>
          {(!info.id)?
        <Link className="btn btn-sm btn-outline-danger me-3 mb-3" to='/admin/land/create'>Crear</Link>
        :
        <Link className="btn btn-sm btn-outline-success mb-3" to={`/admin/land/update/${info.id}`}>Editar</Link>
          }
        </div>
        <h4>Titulo:</h4>
            <p className="lead text-muted">{info?.title}</p>
        {/* <img
              className="bd-placeholder-img-fluid mb-3"
              src={info?.picture}
              alt="Imagen"
              style={{ maxWidth: "100%", height:'auto' }}
            /> */}
            <img
              className="bd-placeholder-img-fluid mb-3"
              src={info?.picture}
              alt="Imagen"
              style={{ maxWidth: "100%", height:'auto' }}
            />
            <h4>Info posicionamiento:</h4>
            <p className="lead text-muted">{info?.info_header}</p>
            <hr></hr>
            <h4>Descripcion:</h4>
        <p className="lead text-muted">{info?.description}</p>
      </div>
    </div>
  </section>
  );
}

export default Portada