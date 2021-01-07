import numpy as np
import matplotlib.pyplot as plt
import matplotlib.collections

__all__ = ['show_meshplot']

def show_meshplot(nodes, elements, x, ifMatrix=False, ax=None, plotNodes=False):
    if not ax: ax=plt.gca()
        
    y = nodes[:,0]
    z = nodes[:,1]
    
    if ifMatrix:
        idx = np.array(np.nonzero(np.triu(x))).T
        widths = (elements[:,None]==idx).all(-1).any(-1).astype(int)
    else:
        widths=x

    #https://stackoverflow.com/questions/49640311/matplotlib-unstructered-quadrilaterals-instead-of-triangles
    def quatplot(y,z, quatrangles, ax=None, **kwargs):

        if not ax: ax=plt.gca()
        yz = np.c_[y,z]
        verts= yz[quatrangles]
        pc = matplotlib.collections.PolyCollection(verts, **kwargs)
        ax.add_collection(pc)
        ax.autoscale()

#     plt.figure()
    ax.set_aspect('equal')

    quatplot(y,z, np.asarray(elements), ax=ax, linewidths=widths, color="black", facecolor="None")
    if plotNodes:            
        ax.plot(y,z, marker="o", ls="", color="black")
        
    ax.axis('off')