
export default function App() {

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className="w-full bg-green-800 p-4">
        <h1 className='text-3xl'>Slime</h1>
        <h2>A open source coupon discovery plugin.</h2>
      </div>
      <div className="my-2">
        <button className='border-zinc-600 border-2 rounded-md p-2 px-8 my-2 cursor-pointer'>
          Report Coupon
        </button>
      </div>
    </div>
  )
}

