It was summer of 2014 when I joined [the team](https://what.studio/). The
team size was quite small at the time, with less than 30 people or so, and
[our game](https://durango.nexon.com/) was still in the early stage of
development, trying out new things and explore all the possibilities out
there. It was a lot of fun.

One day, my boss came along saying "hey, we want to make a realistic in-game
ecosystem, would you like to take charge on that?" So what do you mean by a
*realistic ecosystem*? We have a spectacular in-game view of wild lands, but
what we wanted was far beyond than just looking good. In essence, we wanted
to make an in-game ecosystem that resembles the real-world.

It would be impractical to plant vegetation and other natural resources manually
or randomly. Manual planting would hardly work due to the the sheer size of the
in-game world. Random planting, on the other thand, would certainly violate a
number of rules to which the real ecosystem conforms. For example, we wouldn't
want to plant banana trees in a snow land or in the middle of the ocean.

In order to make our dream come true, we decided to develop a very sophisticated
algorithm to determine the location and the type of plants. The algorithm
considers the type of soil, the temperature, the humidity, and other surrounding
conditions.

<figure>
  <img src="/static/images/ecosim.png" style="max-width:70%"/>
</figure>

The biggest challenge was the sheer volume of computations it takes to construct
a solution. We had tried a number of ways to make these computations fast and
they can be summarized as follows.

## First Approach: Matrix Multiplication For Biomass Precalculation

One of important criteria is something we internally called *biomass*, which
essentially refers the weight or the predominance of each biological entity. In
generally, bigger species such as [baobab trees][baobab] have higher biomass
whereas smaller species have lower biomass. Each speice has different
requirement for surrounding biomass; some prefer higher biomasses nearby, others
prefer lower biomass in the vicinity.

What we need to take into consideration is the sum of all biomasses within the
nearby region when given a particular coordinate, not the biomass of a single
coordinate. Calculating the sum of biomasses within a certain region yields a
time complexity of *O(n<sup>2</sup>)* where *n* is the radius of the region.
Given that we have a square-shaped world (conceptually, in terms of coordinate
systems) of a width of *m*, the total time complexity to calcuate the sum of
biomasses for all possible locations is *O(m<sup>2</sup>n<sup>2</sup>)* and this
can be enormous.

So we started looking into faster methods to calculate the biomasses and came up
with a simple yet very effective algorithm, using matrix multiplications, to
pre-calculate the sum of biomasses for all coordinates. The resulting matrix is
something we call a *biomass map*, which is essentially a lookup table; for each
coordinate, the biomass map stores the sum of the biomasses in the vicinity.

<figure>
  <img src="/static/images/biomass_map_precalculation.png" style="max-width:100%"/>
  <figcaption>Fig.1 - Pre-calculation of biomass maps</figcaption>
</figure>

The naive algorithm for matrix multiplication yields *O(m<sup>3</sup>)*, which
has virtually no advantage over our original method. However, there is faster
algorithm for matrix multiplication that yields *O(m<sup>2.807</sup>)*.[^1] This
gives us a practical headstart by saving a large number of multiplication
operations. Moveover, there is an additional advantage in an engineering
perspective: sequential memory access is faster than random access.[^2]

<figure>
  <img src="/static/images/biomass_map_time_complexities.png" style="max-width:70%"/>
  <figcaption>Fig.2 - Matrix multiplication is faster unless the world is huge</figcaption>
</figure>

As a result, we were able to achieve a marginal, but measurable[^3] improvement
over our original method. However, this still takes about 30 minutes for a world
of 2048x2048, which certainly is a great inconvenience for rapid development. So
we decided to look into other options.

## Second Apprach: OpenCL

One of irresistable solutions to handle computionally intensive tasks is
[GPGPU][gpgpu]. That is exactly what those [GPU][gpu]s are made for: crunching
numbers. There are two major choices when it comes to GPGPU: [OpenCL][opencl]
and [CUDA][cuda]. Although CUDA could achieve a higher performance<sup>[citation
needed]</sup>, we opted for OpenCL because of its portability and vendor
agnostic aspect.

Long story short, we wrote an OpenCL kernel for biomass maps pre-calculation. As
a result, we were able to reduce the 30-minute runtime down to one minute and
fifteen seconds, which is a 96% improvement.

Nevertheless, the GPGPU solution definitely offers remarkable performance gains,
it comes at a price. Most of all, it was a great engineering challenge; it was
difficult to debug, difficult to profile, and difficult to do anything with it.
That's probably because we had no prior GPGPU experience whatsoever. Another
concern was maintenance and recruiting. Software engineers with GPGPU experience
were rare commodities in the job market (at least in 2014, in South Korea).

For this reason, we decided to discard the GPGPU option and move onto a
different one, which will be explained in the next section.

## Third Approach: Compressed Sparse Row

One characteristic of our game world we could exploit was that it is mostly
empty. In many cases, a half of the worlds is deep ocean; players may enter
shallow water areas but they are not allowed to swim into the deep ocean, and
thus there is no biological entities nor natural resources in the deep ocean.
Furthermore, not all land spaces are fully occupied.

This suggests that we might be able to represent our matrices in a [compresses
sparse row (CSR)][csr] format. Then the time complexity will no longer be
relevant to the size of the world, but rather the number of biological entities
and natural resources in the world.

Fortunately, the [math library](https://www.mathdotnet.com/) we use provides
compressed spare row representations of matrices and vectors. After switching to
CSR, we were able to complete the biomass maps computation in just eighteen
seconds, which is slightly slower than the GPGPU solution but certainly
acceptable.

## Conclusion

Ecosystem simulation is inherently computationally intensive. We have explored a
number of different strategies to minimize the computing time. GPGPU offers
lucrative benefits when it comes to large-scale number crunching operations,
however, given our circumstances, it was difficult to employ GPGPU for
production due to practical constraints. We decided to settle with the
compressed sparse row (CSR) representation of matrices as it provides a
comparable performance to that of GPGPU without having engineering and
administrative burdens.

## Public Speech On This Topic

More information (in Korean) can be found in the following public speech deck
from Nexon Developers Conference (NDC) 2015:

<https://www.slideshare.net/suminb/durango-opencl>


[^1]: <https://en.wikipedia.org/wiki/Strassen_algorithm>
[^2]: <https://superuser.com/questions/782197/in-l1-l2-cache-and-dram-is-sequential-access-faster-than-random-access>
[^3]: Unfortunately, I was not able to find the exact numbers because I'm no longer with the company at the time of writing of this article.

[baobab]: https://en.wikipedia.org/wiki/Adansonia
[gpu]: https://en.wikipedia.org/wiki/Graphics_processing_unit
[gpgpu]: https://en.wikipedia.org/wiki/General-purpose_computing_on_graphics_processing_units
[opencl]: https://www.khronos.org/opencl/
[cuda]: https://www.geforce.com/hardware/technology/cuda
[csr]: https://en.wikipedia.org/wiki/Sparse_matrix#Compressed_sparse_row_(CSR,_CRS_or_Yale_format)