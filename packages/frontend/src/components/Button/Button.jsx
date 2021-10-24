const CustomButton = ({text, isLoading, onClick}) => {
    return (
        <button className="button button-primary button-wide-mobile button-sm" onClick={onClick} disabled={isLoading}>
            {
                isLoading && <i className="fas fa-spinner fa-spin"></i>
            }
            {
                !isLoading && text
            }
        </button>
    )
}

export default CustomButton;