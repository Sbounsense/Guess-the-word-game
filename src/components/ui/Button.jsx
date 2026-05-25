import styles from './Button.module.css'

export default function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, style }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
    >
      {children}
    </button>
  )
}
