const CustomRadio = ({
    isChecked,
    onChange,
    name,
    value,
    disabled,
    onBlur
}) => {
    return (
        <label>
            <input
                type='radio'
                name={name}
                checked={isChecked}
                style={{ display: 'none' }}
                onChange={onChange}
                value={value}
                disabled={disabled}
                onBlur={onBlur}
            />
            <span style={styles.outerCircle}>
                {isChecked && (
                    <span style={styles.innerCircle}></span>
                )}
            </span>
        </label>
    )
}

export default CustomRadio

const styles = {
    outerCircle: {
        border: "1px solid #02142E",
        width: '24px',
        height: "24px",
        borderRadius: "50%",
        position: "relative",
        marginRight: "10px",
        display: "inline-block"
    },
    innerCircle: {
        backgroundColor: "#1501FF",
        width: "16px",
        height: '16px',
        borderRadius: "50%",
        position: 'absolute',
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    }
}
