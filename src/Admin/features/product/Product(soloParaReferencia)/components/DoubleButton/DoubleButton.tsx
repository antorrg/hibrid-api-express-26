import style from './DoubleButton.module.css'

type DoubleButtonProps = {
  onClick1: () => void;
  buttonText1: string;
  type1?: "button" | "submit" | "reset";
  disabled1?: boolean;
  className1?: string;
  id1?: string;
  onClick2: () => void;
  buttonText2: string;
  type2?: "button" | "submit" | "reset";
  disabled2?: boolean;
  className2?: string;
  id2?: string;
}

const DoubleButton = ({ onClick1, buttonText1, type1 = 'button', disabled1, className1, id1, onClick2, buttonText2, type2 = 'button', disabled2, className2, id2 }: DoubleButtonProps) => {
  const customClass1 = className1 ? className1 : style.button
  const customClass2 = className2 ? className2 : style.button

  return (
    <>
      <button type={type1} onClick={onClick1} className={customClass1} id={id1} disabled={disabled1}>
        {buttonText1}
      </button>
      <button type={type2} onClick={onClick2} className={customClass2} id={id2} disabled={disabled2}>
        {buttonText2}
      </button>
    </>
  );
};

export default DoubleButton;
