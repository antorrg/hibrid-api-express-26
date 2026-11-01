import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCreateForm } from "../components/ProductCreateForm";
import { type ProductCreateFormData } from "../validations/productSchema";
import { productsApi } from "../../../AdminApi/productsApi";
import { type CreateProduct } from "../../../../types/product";


const CreateProductPage = () => {
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  const onClose = () => {
    setLoad(false);
    navigate(-1);
  };

  const onRetry = () => {
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleSubmit = async (data: ProductCreateFormData) => {
    const confirmed = await productsApi.confirmAction({
      title: '¿Está seguro de crear el producto?'
    })
    if (confirmed) {
      setLoad(true);

      const payload: Omit<CreateProduct, 'id'> = {
        title: data.title,
        picture: data.picture ?? null,
        info_header: data.info_header ?? null,
        info_body: data.info_body ?? null,
        useImg: data.useImg,
        items: data.items.map((i: any) => ({ picture: i.picture ?? null, text: i.text, useImg: i.useImg }))
      };

      try {
        await productsApi.create(
          payload,
          {
            success: () => onClose(),
            reject: () => onRetry()
          }
        );
      } catch (e) {
        console.error(e)
        setLoad(false);
      }
    }
  };

  return (
    <div className="imageBack">
        <div className="coverBack">
          <div className="container-md modal-content colorBack formProductContainer rounded-4 shadow p-4">
            <h3 className="mb-4">Creación de Producto: </h3>
            <ProductCreateForm
              onSubmit={handleSubmit}
              onCancel={onClose}
              load={load}
            />
          </div>
        </div>
   
    </div>
  );
};

export default CreateProductPage;