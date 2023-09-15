---
html:
  offline: true

export_on_save:
  path: html/
  html: true
---

# 结构化绑定

结构化绑定是C++17新增的语法，适当使用能极大地提升编程体验。结构化绑定将引入的标识符绑定到对象的元素或成员上。很多人将结构化绑定视为引用的语法糖，诚然它们有许多相似之处，但二者在语义上还是有很多不同的地方。

## 1. 绑定到数组的元素

首先，结构化绑定能够绑定到数组的元素上：

```cpp
int arr[3] = { 1,2,3 };
auto [a, b, c] = arr;
printf("%d %d %d\n", a, b, c);
```

在这段代码中，定义了`a` `b` `c`三个结构化绑定。通过`printf`可以观察到它们的值分别是`1` `2` `3`，对应数组`arr`的三个元素。

实际上在这个过程中编译器帮我们干了下面的事：首先，引入一个匿名变量，在这里我们叫它`\_unnamed_`，它的各个元素从`arr`复制初始化。然后，将结构化绑定引入的三个名字分别绑定到这个匿名数组的三个元素上。

```cpp
int arr[3] = { 1,2,3 };
int _unnamed_[3] = { arr[0], arr[1], arr[2] };
int &a = _unnamed_[0];
int &b = _unnamed_[1];
int &c = _unnamed_[2];
```

需要注意的是，这里的引用仅仅表示一种绑定关系，即`a`绑定到`\_unnamed_[0]`，并不代表`a`是个引用。例如，我们直接定义一个引用`int &ra = arr[0]`，那么`decltype(ra)`会得到`int&`，而结构化绑定的声明类型是不带引用的：`decltype(a)`得到的是`int`。

那么如何证明上述匿名变量的存在，并且真的发生了复制呢？一个简单的办法是修改`a`的值，`arr[0]`并不会随之变化，说明`a`和`arr[0]`指代的两个不同的对象。当然还有更直观的办法，那就是自定义类的复制构造函数。

```cpp
#include <cstdio>

struct A {
    int a;
    A(int a): a(a) {
        printf("%p: initialized by value %d.\n", this, a);
    }
    A(const A& other): a(other.a) {
        printf("%p: copied from %p by %d.\n", this, &other, a);
    }
};

int main() {
    A arr[3] = {1,2,3};
    puts("==============================");
    auto [a1,a2,a3] = arr;
}
```

运行上述代码，我们很能够观察到程序输出下列内容：

```sh
0xFB98: initialized by value 1.
0xFB9C: initialized by value 2.
0xFBA0: initialized by value 3.
==============================
0xFBE8: copied from 0xFB98 by 1.
0xFBEC: copied from 0xFB9C by 2.
0xFBF0: copied from 0xFBA0 by 3.
```

分割线之前是数组`arr`的三个元素从`int`直接初始化的输出，分割线之后是结构化绑定过程中匿名数组各个元素的复制构造的输出。并且复制的对象的地址也能一一对应。

但是，这只能证明发生了复制，还不足以证明这个匿名变量的存在。编译器完全可以省略匿名变量，直接从数组的三个元素复制初始化三个变量，并且还可以避免前文提到的看起来像引用，却又不是引用的绑定。

```cpp
A arr[3] = {1,2,3};
puts("==============================");
A a1 = arr[0];
A a2 = arr[1];
A a3 = arr[2];
```

## 2. 绑定到数据成员

让我们带着这个问题来看看下面这段代码：

```cpp
#include <cstdio>

struct B {
    A a1, a2;

    B(int a1 = 0, int a2 = 0) : a1(a1), a2(a2) {
        printf("%p: initialized by value %d, %d.\n", this, a1, a2);
    }
    B(const B& b) : a1(b.a1.a), a2(b.a2.a) {
        printf("%p: copied from %p by %d, %d.\n", this, &b, a1.a, a2.a);
    }
};

int main() {
    B b{ 114,514 };
    puts("==============================");
    auto [x,y] = b;
}
```

程序的输出如下：

```sh
0xF968: initialized by value 114.
0xF96C: initialized by value 514.
0xF968: initialized by value 114, 514.
==============================
0xF988: initialized by value 114.
0xF98C: initialized by value 514.
0xF988: copied from 0xF968 by 114, 514.
```

可以看到，这里只调用了一次B的复制构造，说明这个匿名变量确实存在。

和数组类似，结构化绑定可以绑定到类的非静态数据成员。当然并不是每一种类都可以被结构化绑定，它必须有如下性质：

1. 它所有的非静态数据成员在当前语境中可访问。
2. 它所有的非静态数据成员都是它自己，或者同一个基类的直接成员。

结构化绑定并不要求成员必须有`public`访问权限，只要在当前语境中可以访问所有成员即可。

```cpp
class C {
    int c1, c2;
public:
    C() = default;
    void foo(C c) {
        // OK，C的成员函数内，可以访问它的私有成员
        auto [a, b] = c;
    }
};

int main() {
    C c{};
    // Error，外部函数无法访问C的私有成员
    auto [a, b] = c;
}
```

第二点似乎不太直观，我们通过两个例子来说明一下：

```cpp
struct A {
    int a1, a2;
};
struct B : A {};
struct C : A { int c; };
```

我们从`A`派生出`B`和`C`两个类。其中`B`没有增加任何数据成员，它可能只添加了一些成员函数扩展了`A`的功能，这在开发中也是很常见的手法。那么对于`B`来说，它所有的非静态数据成员都是从基类`A`继承而来的，因此`B`符合结构化绑定的要求。而`C`则增加了一个数据成员，因此不满足第二条性质。

另外，结构化绑定和引用还有一个重要的区别，就是它可以绑定到位域成员。这是普通的引用做不到的。

```cpp
struct A {
    int a : 4;
    int b : 4;
};

A bits {};

auto& [max,min] = bits;

max = 0b0111, min = 0b1000;

printf("%d, %d", bits.a, bits.b);
```

## 3. 结构化绑定中的限定符

### 左值引用限定符

刚才我们见到的结构化绑定都有一个复制的过程，会产生一个匿名对象。有时候复制的开销会比较大，我们当然想避免不必要的复制。于是我们可以为结构化绑定添加一个引用限定符，以引用的方式绑定到相应的对象上。

```cpp
int arr[3] {1,2,3};
auto &[a,b,c] = arr;
```

还记得刚刚说过结构化绑定过程中的匿名变量吗？它再一次派上大用场了。如果结构化绑定声明中包含引用限定符，那么这个引入的匿名变量就是一个引用！

```cpp
auto& _unnamed_ = arr;

int &a = _unnamed_[0];
int &b = _unnamed_[1];
int &c = _unnamed_[2];
```

引用`\_unnamed_`绑定到`arr`，而`a`又绑定到`\_unnamed_[0]`，也就是说`a`直接绑定到了`arr[0]`上。`b`和`c`同理。再一次强调，即使添加了引用限定符，结构化绑定也不是引用，`decltype(a)`仍然是`int`而不是`int&`。这里的引用只是为了表达绑定关系。

定义引用不会产生可观察的副作用，我们也就无法直接证明这个匿名变量确实是引用。当然我们还是可以从侧面来应证它，比如说左值引用不能绑定到右值。

```cpp
B foo() { return B{114, 514}; }
// Error，按值返回的函数调用是右值表达式
auto& [x,y] = foo();
```

### 右值引用限定符

如果你要绑定右值表达式，自然可以用右值引用。实际上在结构化绑定中说“右值引用”并不准确，毕竟前面还有一个`auto`占位符。`auto&&`是不是右值引用可就说不准了，让我们来复习一下:

```cpp
int i = 42;
// Error，右值引用不能绑定左值
int&& rref = i;
// OK，auto&&会进行推导
auto&& lref = i;
```

在上面的示例代码中，`auto&& lref = i`会进行类型推导，由于初始化器`i`是个左值，推导出`auto -> int&`再经过引用折叠`int& && -> int&`最终得到`lref`是个左值引用。

结构化绑定引入的匿名变量也是如此，如果引用限定符是`&&`那么匿名变量的类型就会根据这一规则自动推导，这也是`auto&&`被称为万能引用的原因。

```cpp
int arr[3] {1,2,3};
auto&& [a,b,c] = arr;

auto&& _unnamed_ = arr;
// 经过推导得到左值引用：
int (&_unnamed_)[3] = arr;

```

### cv限定符

除了用右值引用来绑定到右值表达式，`const`限定的左值引用也可以绑定到右值。

```cpp
const auto& [x,y] = foo();

const auto& _unnamed_ = foo();
const A& x = _unnamed_.a1;
const A& y = _unnamed_.a2;
```

当然，绑定到右值在其次，加上`const`限定之后，我们就不能修改这些结构化绑定的值了。在需要的时候加上`const`能让我们的程序更加安全。

既然是cv限定符，自然还有`volatile`。我们稍微提一下，这个限定符实际上很少用到，甚至在C++20中弃用了大部分语境中的`volatile`限定，包括结构化绑定。你仍然可以写，但编译器可能会发出警告。`volatile`是另一个很大的话题，并且涉及到很多实现上的细节，这里就不展开讲了。

### 存储类说明符（C++20起）

从C++20开始，你可以为结构化绑定加上`static`或者`thread_local`这两个存储类说明符，它们同样是作用在引入的匿名变量上。

```cpp
int arr[3] {1,2,3};
static auto [a,b,c] = arr;
// 引入的匿名变量具有静态存储期，它会一直持续到程序结束
static int _unnamed_[3] = {arr[0],arr[1],arr[2]};
```

使用这两个说明符的时候要注意，如果再加上引用限定符，绑定到某个局部变量上，很容易产生悬垂引用。这与普通的静态变量规则是相同的。

## 4. 结构化绑定的声明类型

`decltype`运算符可以获取实体的声明类型。刚刚我们说到， 对结构化绑定使用`decltype`得到的类型不包含引用，这个说法其实并不全面，看下面的例子：

```cpp
#include <cstdio>
#include <memory>
struct R {
    int&  a;
    int&& b;
};
int main() {
    int a,b;
    R r{a, std::move(b)};
    auto& [x,y] = r;
    decltype(x) i = a;            // -> int&
    decltype(y) j = std::move(b); // -> int&&
}
```

这就是结构化绑定和引用的根本区别，结构化绑定的声明类型取决于它所绑定的对象的声明类型，如果底层对象的声明类型是引用，则结构化绑定的声明类型也是引用。对于数组来说，由于不存在引用的数组，因此绑定到数组的结构化绑定的声明类型永远不会是引用；而绑定到数据成员的结构化绑定则取决于成员的声明类型。

## 5. 初始化器

上面的代码中我们一直都是使用等于号形式的初始化器。实际上结构化绑定还允许花括号和圆括号初始化。大多数情况下，它们区别不大。唯一的区别在于初始化匿名变量的时候，等于号的形式使用复制初始化，而花括号或者圆括号的形式使用直接初始化。复制初始化不考虑`explicit`构造函数。

```cpp
struct E{
    int a, b, c;
    E() = default;

    // 注意 explicit 复制构造
    explicit E(const E& e) :
        a(e.a),b(e.b),c(e.c)
    {}
};

E arr[3] = {};

// Error，复制初始化不考虑explicit构造函数
auto [a,b,c] = arr;
// OK，直接初始化考虑explicit构造函数
auto [a,b,c] { arr };
auto [a,b,c] ( arr );

// Error，复制初始化不考虑explicit构造函数
auto [a,b,c] = arr[0];
// OK，直接初始化考虑explicit构造函数
auto [a,b,c] { arr[0] };
auto [a,b,c] ( arr[0] );
```

## 6. 绑定到元组式类型的元素

结构化绑定还能绑定到例如`std::tuple"`或者`std::pair`，甚至`std::array`这些类型上。但仔细想想，就会发现事情并没有那么简单。`pair`还能用下面这个形式强行解释一下，结构化绑定是绑定到它的两个数据成员上。

```cpp
template <class T1, class T2>
struct pair{
    T1 first;
    T2 second;
};
```

但`tuple`呢？它有公开可访问的数据成员吗？标准库似乎没有提供给我们。访问`tuple`的元素必须通过`std::get`函数。如果你了解一点模板元编程，那你应该知道`tuple`通常是用模板递归继承的方式实现的，它的数据成员分布在一层一层的基类里。这明显是不符合结构化绑定绑定到数据成员的要求的。

再说说`std::array`，虽然它名字就叫数组，长的像数组，用起来也像数组，但它毕竟不是数组，`std::is_array<std::array<int,3>>::value`肯定是`false`。

那么结构化绑定是如何实现的呢？其实，C++为我们提供了一套<ruby>精<rp>(</rp><rt style="font-size: large">fù</rt><rp>)</rp>妙<rp>(</rp><rt style="font-size: large">zá</rt><rp>)</rp>
</ruby>的机制，可以自定义结构化绑定规则，我们通常叫它元组式绑定。

如果你只是使用标准库提供的这些元组式类型，那么不必担心：就把`std::pair`和`std::tuple`当成所有成员都能公开访问的结构体，把`std::array`当成普通的数组。标准库已经给你实现好了相关的细节，不了解这套机制的工作原理也不影响你使用。

使用例：

```cpp
#include <map>
#include <tuple>
#include <cstdio>

using namespace std;

int main() {
    // 构造一个匿名tuple，并将i, c, f绑定到它的元素上
    auto [i, c, d] = make_tuple(1, '2', 3.0);
    printf("%d, %c, %f\n\n", i, c, d);

    // 配合范围for优雅地遍历map
    map<int, int> map {
        {0, 114},{1,514},{2,1919},{3,810}
    };
    for (const auto& [k, v] : map) {
        printf("{ %d: %-4d }\n", k, v);
    }

    // 优雅地检查map的插入操作是否成功
    if (auto [iter, ok] = map.insert({ 0,42 }); ok) {
        auto [k, v] = *iter;
        printf("\nnew item: { %d: %d }\n", k, v);
    }
    else {
        auto [k, v] = *iter;
        printf("\nkey exsists: { %d: %d }\n", k, v);
    }
}
```

程序输出：

```sh
1, 2, 3.000000

{ 0: 114  }
{ 1: 514  }
{ 2: 1919 }
{ 3: 810  }

key exsists: { 0: 114 }
```

如果你对其中的细节感兴趣，或者想要给你写的类实现自定义结构化绑定，就让我们开始吧。

首先，编译器会检查结构化绑定的初始化表达式的类型，我们暂时称它为`T`。如果`T`是数组类型，那就按照前文所述的规则绑定到数组元素。否则，编译器就会检查`std::tuple_size\<T>`是否是一个完整类型，并且拥有一个名叫`value`的静态整数常量成员。如果是，那就进行元组式绑定。否则，按照前文所述的规则绑定到`T`的数据成员。

`std::tuple_size`是标准库中声明的一个类模板，此外，标准库还提供了针对`std::pair`，`std::tuple`，`std::array`的特化。

```cpp
namespace std{
    // 主模板声明
    template <class>
    struct tuple_size;

    // 针对std::pair的特化
    template <class T1, class T2>
    struct tuple_size<std::pair<T1, T2>> {
        static constexpr size_t value = 2;
    }

    // 针对std::tuple的特化
    template <class...T>
    struct tuple_size<std::tuple<T...>> {
        static constexpr size_t value = sizeof...(T);
    }

    // 针对std::array的特化
    template <class T, size_t N>
    struct tuple_size<std::array<T,N>> {
        static constexpr size_t value = N;
    }
}
```

上述代码只是实现`std::tuple_size`特化的方式之一，仅作为示例。如果你要给自定义类型实现结构化绑定，第一步就是写一个相应的`std::tuple_size`特化。它必须包含一个静态的整数常量成员，名字为`value`。它的值必须是正整数，表示可以结构化绑定的元素的数量，如果它的值和`[ 标识符列表 ]`的数量不相等，则编译器会报错。惯例上将它的类型设定为`size_t`，但任意整数类型都是可以的。

```cpp
template<>
struct tuple_size<T> {
    static constexpr size_t value = N;
}
```

然后，编译器同样会引入一个匿名变量来保存初始化表达式的值。我们以`std::tuple`为例看看下面的代码：

```cpp
//             std::tuple<int,char,double>
auto [i,c,d] = std::make_tuple(1, '2', 3.0);
auto _unnamed_ = std::make_tuple(1, '2', 3.0);
```

为了将结构化绑定中的标识符绑定到某个对象，编译器还会为每一个标识符引入一个新的变量。它的类型是`std::tuple_element<0, T>::type 的引用`。如果它对应的初始化表达式的值类别是左值，那么它是左值引用，否则，它是右值引用。它对应的初始化表达式的形式见后文详述。

```cpp
using T = std::tuple<int,char,double>;

std::tuple_element<0, T>::type&  _i
    = lvalue-init-expression;

std::tuple_element<0, T>::type&& _i
    = rvalue-init-expression;
```

这也就意味着，为了实现自定义结构化绑定，我们还需要自己实现相应的`std::tuple_element`特化。它有两个模板参数，第一个参数是一个整数，表示结构化绑定的标识符的序号，从0开始递增；第二个参数是你的自定类型。以`std::pair`为例，看看`std::tuple_element`的自定义特化要怎么写：

```cpp
namespace std {
    // 主模板声明
    template<size_t I, class T>
    struct tuple_element;

    // 针对std::array的特化
    template <size_t I, class Ta, size_t Na>
    struct std::tuple_element<I, std::array<Ta,Na>> {
        using type = Ta;
    };

    // 针对std::pair的特化
    template <class T1, class T2>
    struct std::tuple_element<0, std::pair<T1,T2>> {
        using type = T1;
    };
    template <class T1, class T2>
    struct std::tuple_element<1, std::pair<T1,T2>> {
        using type = T2;
    };
}
```

针对`std::tuple`的特化实现起来较为复杂，需要用到模板递归继承，这里就不作展示了。感兴趣的读者可以自行查找资料，或者翻看STL的源代码。

总结来说，`std::tuple_element<I, T>::type`表示了类型`T`的第`I`个可绑定元素的类型。

有了类型，为每个结构化绑定引入了额外的引用变量之后，接下来就要对这些变量进行初始化了，毕竟引用必须在定义的时候就初始化。首先，编译器会去找类型`T`是否有名为`get`的成员函数模板，并且`get`的第一个模板参数是非类型模板参数。如果找到这样的成员，那么就调用`\_unnamed_.get\<I>()`来初始化第`I`个变量。如果没有这样的成员，就调用`get\<I>(\_unnamed_)`来初始化，并且查找`get`的过程只进行实参依赖查找(ADL, Argument Dependent Lookup)，不考虑其他形式。

另外，在调用`get`的时候，如果匿名变量`\_unnamed_`的类型是左值引用，则调用过程中它保持为左值；否则将它视为亡值。也就是说如果`get`同时存在接受左值引用和右值引用的重载时，前者调用左值引用的版本，而后者调用右值引用的版本，这实际上类似于完美转发。

```cpp
auto [i,c,d] = std::make_tuple(1, '2', 3.0);
// 引入的匿名变量
auto _unnamed_ = std::make_tuple(1, '2', 3.0);
// _unnamed_的类型T
using T = std::tuple<int,char,double>;

// _unnamed_不是左值引用，在调用get时转换到亡值
// 通过ADL找到std::get<size_t>(std::tuple&&)
// 它返回右值引用属于亡值表达式，因此_i的类型是右值
// 引用。最后，i绑定到_i指代的对象上。
std::tuple_element<0, T>::type&& _i
    = get<0>(static_cast<T&&>(_unnamed_));
std::tuple_element<1, T>::type&& _c;
    = get<1>(static_cast<T&&>(_unnamed_));
std::tuple_element<2, T>::type&& _d;
    = get<2>(static_cast<T&&>(_unnamed_));

auto tuple = std::make_tuple(1, '2', 3.0);
auto& [i,c,d] = tuple;
// 引入的匿名变量
auto& _unnamed_ = tuple;
// _unnamed_的类型T
using T = std::tuple<int,char,double>;

// _unnamed_是左值引用，在调用get时保持为左值
// 通过ADL找到std::get<size_t>(std::tuple&)
// 它返回左值引用，因此_i的类型是左值引用
std::tuple_element<0,T>::type& _i = get<0>(_unnamed_);
std::tuple_element<1,T>::type& _c = get<1>(_unnamed_);
std::tuple_element<2,T>::type& _d = get<2>(_unnamed_);
```

最后，将结构化绑定引入的标识符绑定到额外引入的这些变量所指代的对象上。`decltype(i)`得到的类型就是`std::tuple_element <0, std::tuple<int, char, double>>::type`。对于元组式绑定，结构化绑定的声明类型完全取决于`std::tuple_element`的特化。这是标准库刻意为之，为了模拟直接绑定到引用类型的数据成员的情况，例如：

```cpp
int a, b;
auto tuple = std::tuple<int&, int&&>{a, std::move(b)};
auto [x,y] = tuple;
decltype(x); // -> int&
decltype(y); // -> int&&

```

让我们通过一个例子来看看完整的自定义结构化绑定过程。考虑如下场景：标准库在常用数学函数库中提供了`div_t div(int, int)`函数。它计算两个整数相除得到的商和余数，并通过一个结构体返回。但是标准并未规定结构体`div_t`两个成员的顺序，因此直接绑定到数据成员可能会导致顺序不对，于是我们可以为它定义一套元组式的绑定方式，让第一个变量始终绑定到商，而第二个变量始终绑定到余数。

```cpp
namespace std {
    // Maybe
    struct div_t {
        int quot; // 商
        int rem;  // 余数
    }
    // Or
    struct div_t {
        int rem;  // 余数
        int quot; // 商
    }

    div_t div( int x, int y );
}
```

首先，我们需要为`std::tuple_size\<T>`写一个特化。此处的`std::tuple_size\<div_t>::value`即结构化绑定能绑定的成员的数量，因此我们将它设置为2。

```cpp
template<>
struct std::tuple_size<div_t> {
    static constexpr size_t value = 2;
};
```

然后，我们需要为`std::tuple_element`这个模板类写一些特化，用于确定各个元素的类型。`div_t`只有两个成员，我们直接写两个全特化即可。

```cpp
template<>
struct std::tuple_element<0, div_t>{
    using type = int;
};
template<>
struct std::tuple_element<1, div_t> {
    using type = int;
};
```

最后，我们需要写一个`get`函数，用来绑定匿名变量的各个元素。此处的`constexpr if`也是C++17的新特性，它的条件表达式必须是一个编译期常量，因此它会在编译期就能根据条件选择相应的分支，直接将另一个分支删除，有点类似于预处理指令`#ifdef`-`#else`-`#endif`的效果。

对于我们这个简单的例子`constexpr if`并不是必须的，因为这里的if两个分支返回的类型是相同的。如果`if`两个分支返回不同的类型，就可以通过`constexpr if`消除不需要的分支，保证编译能够通过。

```cpp
template<size_t I>
using div_elem_t = std::tuple_element_t<I, div_t>;

template<size_t I>
div_elem_t<I>& get(div_t& div) {
    if constexpr (I == 0)
        return div.quot;
    else
        return div.rem;
}

template<size_t I>
div_elem_t<I>&& get(div_t&& div) {
    if constexpr (I == 0)
        return static_cast<div_elem_t<I>&&>(div.quot);
    else
        return static_cast<div_elem_t<I>&&>(div.rem);
}
```

完整的示例代码如下：

```cpp
#include <cstdlib>
#include <cstdio>
#include <utility>

template<>
struct std::tuple_size<div_t> {
    static constexpr size_t value = 2;
};

template<>
struct std::tuple_element<0, div_t>{
    using type = int;
};
template<>
struct std::tuple_element<1, div_t> {
    using type = int;
};

template<size_t I>
using div_elem_t 
    = typename std::tuple_element<I, div_t>::type;

template<size_t I>
div_elem_t<I>& get(div_t& div) {
    if constexpr (I == 0)
        return div.quot;
    else
        return div.rem;
}

template<size_t I>
div_elem_t<I>&& get(div_t&& div) {
    if constexpr (I == 0)
        return static_cast<div_elem_t<I>&&>(div.quot);
    else
        return static_cast<div_elem_t<I>&&>(div.rem);
}

int main() {
    auto[quot, rem] = std::div(9,4);
    printf("quot = %d, rem = %d\n", quot, rem);
}
```

## 完整语法

> *存储类说明符* :（C++20起）
>> `static`
>> `thread_local`
>
> *cv限定符* :
>> `const`
>> `volatile`（C++20起弃用）
>> `const volatile`（C++20起弃用）
>
> *引用限定符* :
>> `&`
>> `&&`
>
> *初始化器* :
>> `=`*初始化表达式*
>> `{`*初始化表达式*`}`
>> `(`*初始化表达式*`)`
>
> *结构化绑定声明* :
>> *存储类说明符ₒₚₜ* *cv限定符ₒₚₜ* `auto` *引用限定符ₒₚₜ* `[`*标识符列表*`]` *初始化器* `;`
