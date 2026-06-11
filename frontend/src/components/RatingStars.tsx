interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
  onChange?: (rating: number) => void
}

export default function RatingStars({ rating, size = 'md', readonly = true, onChange }: RatingStarsProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value)
    }
  }

  return (
    <div className={`inline-flex items-center gap-0.5 ${sizeClasses[size]} ${!readonly ? 'cursor-pointer' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${!readonly ? 'hover:scale-110 transition-transform' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}
