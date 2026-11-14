const CustomSearch = ({search, setSearch, placeholder}) => {
  return (
    <div>
        <input
            type="search"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
