/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle(src) {
	const copy = [...src]

	const length = copy.length
	for (let i = 0; i < length; i++) {
		const x = copy[i]
		const y = Math.floor(Math.random() * length)
		const z = copy[y]
		copy[i] = z
		copy[y] = x
	}

	if (typeof src === 'string') {
		return copy.join('')
	}

	return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/
const initialWords = [
	'react',
	'javascript',
	'array',
	'function',
	'component',
	'props',
	'state',
	'hooks',
	'context',
	'reducer',
]

function App() {
	const [words, setWords] = React.useState(
		() => JSON.parse(localStorage.getItem('words')) || shuffle(initialWords)
	)
	const [currentWord, setCurrentWord] = React.useState(() => shuffle(words[0]))
	const [input, setInput] = React.useState('')
	const [points, setPoints] = React.useState(
		() => parseInt(localStorage.getItem('points'), 10) || 0
	)
	const [strikes, setStrikes] = React.useState(
		() => parseInt(localStorage.getItem('strikes'), 10) || 0
	)
	const [passes, setPasses] = React.useState(3)
	const [inputAnimation, setInputAnimation] = React.useState('')

	React.useEffect(() => {
		localStorage.setItem('words', JSON.stringify(words))
		localStorage.setItem('points', points.toString())
		localStorage.setItem('strikes', strikes.toString())
	}, [words, points, strikes])

	function handleGuess(e) {
		e.preventDefault()
		if (input.toLowerCase() === words[0]) {
			setPoints(points + 1)
			const newWords = words.slice(1)
			setWords(newWords)
			setCurrentWord(shuffle(newWords[0] || ''))
			setInputAnimation('')
		} else {
			setStrikes(strikes + 1)
			setInputAnimation('animate__animated animate__headShake')
			setTimeout(() => setInputAnimation(''), 1000)
		}
		setInput('')
	}

	function handlePass() {
		if (passes > 0) {
			setPasses(passes - 1)
			const newWords = words.slice(1)
			setWords(newWords)
			setCurrentWord(shuffle(newWords[0] || ''))
		}
	}

	function handleInput(e) {
		setInput(e.target.value)
	}

	function resetGame() {
		setWords(shuffle(initialWords))
		setCurrentWord(shuffle(words[0]))
		setInput('')
		setPoints(0)
		setStrikes(0)
		setPasses(3)
		localStorage.clear()
	}

	if (words.length === 0 || strikes >= 3) {
		return (
			<div className='flex flex-col items-center justify-center h-screen bg-gray-100 p-4'>
				<h2 className='text-2xl font-bold mb-4'>Game Over</h2>
				<p className='text-lg mb-4'>Points: {points}</p>
				<button
					onClick={resetGame}
					className='bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300'
				>
					Play Again
				</button>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center justify-center h-screen bg-gray-100 p-4'>
			<h2 className='text-2xl font-bold mb-4'>Scramble</h2>
			<p className='text-lg mb-2'>Scrambled Word: {currentWord}</p>
			<p className='mb-4'>
				Points: {points} | Strikes: {strikes} | Passes: {passes}
			</p>
			<form onSubmit={handleGuess} className='flex flex-col items-center gap-4'>
				<input
					type='text'
					value={input}
					onChange={handleInput}
					className={`form-input px-4 py-2 rounded border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition duration-300 ${inputAnimation}`}
				/>
				<div className='flex gap-2'>
					<button
						type='submit'
						className='bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300'
					>
						Guess
					</button>
					<button
						type='button'
						onClick={handlePass}
						className='bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300'
					>
						Pass
					</button>
				</div>
			</form>
		</div>
	)
}

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(<App />)
