import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemCreateForm } from "../components/ItemCreateForm";
import { type ItemCreateFormData } from "../validations/productSchema";
import { productsApi } from "../../../AdminApi/productsApi";


const CreateItemPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [load, setLoad] = useState(false);

  const onClose = () => {
    setLoad(false);
  };

  const cancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (data: ItemCreateFormData) => {
    const confirmed = await productsApi.confirmAction({
      title: '¿Está seguro de crear el item?'
    })

    if (confirmed) {
      setLoad(true);

      const payload = {
        ProductId: data.ProductId,
        text: data.text,
        picture: data.picture ?? null,
        useImg: data.useImg
      };

      try {
        const result = await productsApi.createItem(payload);

        if (result) {
          //alert("Item creado con éxito"); // Fallback alert
          navigate(-1);
        } else {
          //alert("Error al crear item");
          onClose();
        }
      } catch (error) {
        //alert("Error al procesar la solicitud");
        console.error(error);
        onClose();
      }
    }
  };

  if (!productId) {
    return <div>Error: Product ID is missing</div>;
  }

  return (
    <div className="imageBack">

      <div className="coverBack" >
        <div className="container-md modal-content colorBack formProductContainer rounded-4 shadow p-4">
          <h2 className="title-form m-0">Agregar Nuevo Item</h2>
        <ItemCreateForm
          productId={Number(productId)}
          onSubmit={handleSubmit}
          onCancel={cancel}
          load={load}
        />
       </div>
      </div>
    </div>
  );
};

export default CreateItemPage;