import { memo, useCallback } from 'react'

const inputStyle = {
  width:'100%',
  border: '1px solid #02142E',
  borderRadius: '8px',
  height: '40px',
}

const CustomSearch = memo(({search, setSearch, placeholder}) => {
  const handleChange = useCallback((event) => setSearch(event.target.value), [setSearch])

  return (
    <div>
        <input
            type="search"
            placeholder={placeholder}
            value={search}
            onChange={handleChange}
            style={inputStyle}
        />
    </div>
  )
})

export default CustomSearch
