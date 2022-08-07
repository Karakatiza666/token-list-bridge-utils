import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { compareTokenInfos } from './utils'

// Substitute values of fields of a with values from b 
const substitute = <T>(a: T, b: any) => 
  Object.keys(a).reduce((r, k) => {
    if (b[k] && a[k] !== b[k]) {
      r[k] = b[k]
    }
    return r
  }, {} as T)

/**
 * Extends token list with children of all tokens with extensions.bridgeInfo defined
 * as separate root-level entries, pointing to their parent.
 * Mutates passed tokenList
 * @param tokenList TokenList with normalized (non-duplicated) l2 bridgeInfo filled
 * @returns TokenList with denormalized l2 bridgeInfo
 */
export function extendTokenList(tokenList: TokenList) {
  // .forEach doesn't iterate through newly pushed items
  tokenList.tokens.forEach(({chainId: rootId, address, extensions, ...root}) => {
    tokenList.tokens.push(
      ...Object.entries(extensions?.bridgeInfo ?? {})
        .map(([chainId, {tokenAddress, ...child}]: any) =>
          ({
            chainId: parseInt(chainId) || chainId,
            address: tokenAddress, ...root, ...child,
            extensions: {
              bridgeInfo: {
                [rootId]: { tokenAddress: address, ...substitute(child, root) }
              }
            }
          }) as TokenInfo
        )
    )
  })
  tokenList.tokens.sort(compareTokenInfos)
  return tokenList
}
