


# 高效提升代码`auto`含量：
<div style="color:orange; font-size: 56pt; font-weight: 500;margin-bottom:20px">
简写函数模板
</div>

```cpp
auto auto_(auto _auto) -> decltype(auto) {
    auto _auto_ = _auto;
    return _auto_;
}
```


### C++20

***

## 常规函数模板声明

```cpp
template<class T1, class T2>
void func(T1 arg1, T2 arg2) {
    /*function body*/
}
```

```cpp
// 推导出 T1 = int，T2 = double
// 实例化并且调用func<int, double>(0, 0.0)
func(0, 0.0);
```
***

## 简写形式

```cpp
void func(auto arg1, auto arg2) {
    /*function body*/
}
```

- 函数形参列表含有`auto`占位符类型

- 每一个`auto`占位符都在模板形参列表末尾追加一个类型模板形参

***
## 限定符与修饰符

```cpp
void foo(
    const auto &arg1,
    auto (*arg2)[5],
    auto&&...args
);
```
```cpp
template<class T1, class T2, class...Ts>
void foo(
    const T1 &arg1,
    T2 (*arg2)[5],
    Ts&&...args
);
```


***
## 限制

- 只能简写函数形参列表用到的类型形参

```cpp
template<class R>
R foo(auto arg);
// 上述声明与此等价
template<class R, class T>
R foo(T arg);
```

```cpp
template<
    template<class, size_t>class Template,
    class T, size_t N
>
void foo(Template<T, N> arg);
```
***

## 受概念制约的简写

```cpp
#include <concepts>

void bar(std::integral auto i);

// 等价于
template <std::integral T>
void bar(T i);
```

***

- 和普通函数模板一样可以特化

```cpp

template<>
void bar(unsigned long long i) {
    std::cout << "unsigned long long";
}

```