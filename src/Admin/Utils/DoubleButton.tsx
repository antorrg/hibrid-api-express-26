import React from 'react'

interface DoubleButtonProps {
    typeLeft?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
    classNameLeft?: string
    onClickLeft?: React.MouseEventHandler<HTMLButtonElement>
    textLeft?: React.ReactNode
    disabledLeft?: boolean
    typeRight?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
    classNameRight?: string
    onClickRight?: React.MouseEventHandler<HTMLButtonElement>
    textRight?: React.ReactNode
    disabledRight?: boolean
    containerClassName?: string
}

const DoubleButton = ({
    typeLeft='button',
    classNameLeft,
    onClickLeft,
    textLeft = 'Cancelar',
    disabledLeft= false,
    typeRight='button',
    classNameRight,
    onClickRight,
    textRight = 'Ok',
    disabledRight= false,
    containerClassName
}:DoubleButtonProps) => {
    const styleLefth = classNameLeft ?? "btn btn-outline-secondary rounded-pill px-4"
    const styleRight = classNameRight ?? "btn btn-primary rounded-pill px-4 fw-semibold"

  return (
            <div className={containerClassName ?? "d-flex justify-content-end align-items-center gap-3 pt-3 border-top border-secondary-subtle"}>
              <button
                type={typeLeft}
                className={styleLefth}
                onClick={onClickLeft}
                disabled= {disabledLeft}
              >
                {textLeft}
              </button>
              <button
                type={typeRight}
                className={styleRight}
                onClick={onClickRight}
                disabled={disabledRight}
              >
                {textRight}
              </button>
            </div>
  )
}

export default DoubleButton
