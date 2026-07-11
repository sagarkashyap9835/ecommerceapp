import { View, Text } from 'react-native'
import React,{useEffect, useState} from 'react'
import { Product } from '@/assets/constants/types'
import { dummyProducts } from '@/assets/assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';

export default function Shop() {
    const [product,setProducts]=useState<Product[]>([]);
    const [loading,setLoading]=useState(true);
    const [loadingMore,setLoadingMore]=useState(false);
    const [page,setPage]=useState(1);
    const [hasMore,setHasMore]=useState(true);

const fetchProducts=async(pageNumber=1)=>{
    if(pageNumber===1){
        setLoading(true)
    }else{
       setLoadingMore(true)
    }
    try {
        const start=(pageNumber-1)*10;
        const end=start+10;
        const paginatedData=dummyProducts.slice(start,end)
        if(pageNumber==1){
            setProducts(paginatedData)
        }else{
            setProducts(prev=>[...prev,...paginatedData])
        }
        setHasMore(end<dummyProducts.length)
        setPage(pageNumber)
    } catch (error) {
       console.error("pagination error",error) 
    }finally{
        setLoading(false)
        setLoadingMore(false)
    }
}
const loadMore=()=>{
if(!loadingMore && !loading && hasMore){
    fetchProducts(page+1)
}
}

useEffect(()=>{
    fetchProducts(1)
},[])

  return (
   <SafeAreaView className='flex-1 bg-surface' edges={['top']}>
<Header title='shop' showBack showCart/>
   </SafeAreaView>
  )
}