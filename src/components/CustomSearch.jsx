import React from 'react'

const CustomSearch = ({search, setSearch, placeholder}) => {
    const [focused, setFocused] = React.useState(false)

  return (
    <div>
        <input
            type="search"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width:'100%',
              border: '1px solid #02142E',
              borderRadius: '8px',
              height: '40px'
            }}
        />
    </div>
  )
}

export default CustomSearch