import { CORPUS } from "./corpus"
import { buildIndex, search } from "./bm25"

const IDX = buildIndex(CORPUS)

export { CORPUS, search, IDX }

